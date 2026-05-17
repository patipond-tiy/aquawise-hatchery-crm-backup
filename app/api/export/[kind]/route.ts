import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { currentNurseryScope } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { ZipBuilder } from '@/lib/export/zip';
import type { Json } from '@/lib/database.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Kind = 'customers_csv' | 'pcr_zip' | 'full_backup';

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function recordExport(
  nurseryId: string,
  userId: string,
  kind: Kind
): Promise<void> {
  const db = await createClient();
  const { error } = await db.from('data_exports').insert({
    nursery_id: nurseryId,
    kind,
    requested_by: userId,
    completed_at: new Date().toISOString(),
  });
  if (error) {
    console.error('[v0] data_exports insert failed', kind, error.message);
  }
}

/**
 * H2 — data export. Owner/counter_staff/auditor only (`data:export`).
 * CSV streams row-by-row; full backup streams NDJSON; PCR ZIP fetches each
 * signed blob and packs it. Every export writes a `data_exports` audit row.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kind: string }> }
) {
  const { kind } = await params;
  if (!['customers_csv', 'pcr_zip', 'full_backup'].includes(kind)) {
    return NextResponse.json({ error: 'unknown kind' }, { status: 400 });
  }

  const scope = await currentNurseryScope();
  if (!scope) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!can(scope.role, 'data:export')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  if (kind === 'customers_csv') {
    const { data: customers } = await supabase
      .from('customers')
      .select('farm, name, phone, zone, status, created_at')
      .order('created_at', { ascending: true });

    const header = [
      'farm_name',
      'owner',
      'phone',
      'zone',
      'status',
      'created_at',
    ];
    const rows = customers ?? [];
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode(header.join(',') + '\n'));
        for (const r of rows) {
          controller.enqueue(
            enc.encode(
              [
                csvCell(r.farm),
                csvCell(r.name),
                csvCell(r.phone),
                csvCell(r.zone),
                csvCell(r.status),
                csvCell(r.created_at),
              ].join(',') + '\n'
            )
          );
        }
        controller.close();
      },
    });

    await recordExport(scope.nurseryId, scope.userId, 'customers_csv');
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="customers-${today}.csv"`,
      },
    });
  }

  if (kind === 'full_backup') {
    const [customers, batches, pcr, alerts] = await Promise.all([
      supabase.from('customers').select('*'),
      supabase.from('batches').select('*'),
      supabase.from('pcr_results').select('*'),
      supabase.from('alerts').select('*'),
    ]);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const enc = new TextEncoder();
        const emit = (entity: string, rows: unknown[] | null) => {
          for (const row of rows ?? []) {
            controller.enqueue(
              enc.encode(JSON.stringify({ entity, row }) + '\n')
            );
          }
        };
        emit('customer', customers.data);
        emit('batch', batches.data);
        emit('pcr_result', pcr.data);
        emit('alert', alerts.data);
        controller.close();
      },
    });
    await recordExport(scope.nurseryId, scope.userId, 'full_backup');
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Content-Disposition': `attachment; filename="backup-${today}.ndjson"`,
      },
    });
  }

  // pcr_zip — bundle every cert PDF for this nursery's batches.
  const { data: batches } = await supabase
    .from('batches')
    .select('id');
  const batchIds = (batches ?? []).map((b) => b.id);
  const { data: certs } = await supabase
    .from('batch_certs')
    .select('batch_id, pdf_url')
    .in('batch_id', batchIds.length ? batchIds : ['__none__']);

  const svc = await createServiceClient();
  const zip = new ZipBuilder();
  for (const c of certs ?? []) {
    // pdf_url is the storage object path in the private pcr-certificates bucket.
    const path = c.pdf_url.replace(/^.*pcr-certificates\//, '');
    const { data: signed } = await svc.storage
      .from('pcr-certificates')
      .createSignedUrl(path, 60);
    if (!signed?.signedUrl) continue;
    const res = await fetch(signed.signedUrl);
    if (!res.ok) continue;
    const buf = new Uint8Array(await res.arrayBuffer());
    zip.add(`${c.batch_id}.pdf`, buf);
  }
  const zipped = zip.finish();
  await recordExport(scope.nurseryId, scope.userId, 'pcr_zip');

  return new NextResponse(zipped as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="pcr-reports-${today}.zip"`,
    },
  });
}

export type { Kind, Json };
