import 'server-only';
import path from 'node:path';
import {
  Document,
  Page,
  View,
  Text,
  Font,
  renderToBuffer,
  StyleSheet,
} from '@react-pdf/renderer';
import type { BatchDetail, NurseryBrand } from '@/lib/types';

// Noto Sans Thai for Thai glyphs (the certificate is Thai-first per brand
// voice). Bundled locally in public/fonts and registered from the filesystem
// at render time — deterministic and offline-safe (no network at render).
let fontsRegistered = false;
function ensureFonts(): void {
  if (fontsRegistered) return;
  Font.register({
    family: 'NotoSansThai',
    src: path.join(
      process.cwd(),
      'public',
      'fonts',
      'NotoSansThai-Regular.ttf'
    ),
  });
  fontsRegistered = true;
}

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: 'NotoSansThai',
    fontSize: 11,
    color: '#14131F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '2 solid #004AAD',
    paddingBottom: 16,
    marginBottom: 24,
  },
  nurseryName: { fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 20, marginBottom: 4, color: '#004AAD' },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottom: '1 solid #E6E8EE',
  },
  metaLabel: { color: '#6B7280' },
  metaValue: { fontWeight: 'bold' },
  sectionTitle: { fontSize: 13, marginTop: 24, marginBottom: 10 },
  pcrRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottom: '1 solid #E6E8EE',
  },
  pcrCell: { flex: 1 },
  footer: {
    marginTop: 36,
    paddingTop: 14,
    borderTop: '1 solid #E6E8EE',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stamp: { fontSize: 11, color: '#004AAD', fontWeight: 'bold' },
});

function thaiDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function statusTh(s: string): string {
  if (s === 'negative') return 'ไม่พบเชื้อ';
  if (s === 'positive') return 'พบเชื้อ';
  return 'รอผล';
}

export function PcrCertDocument({
  batch,
  brand,
}: {
  batch: BatchDetail;
  brand: NurseryBrand;
}) {
  const generatedAt = thaiDate(new Date().toISOString());
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.nurseryName}>{brand.displayNameTh}</Text>
            <Text style={{ color: '#6B7280', marginTop: 2 }}>
              {brand.displayNameEn}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>ใบรับรองคุณภาพลูกกุ้ง</Text>
        <Text style={{ color: '#6B7280', marginBottom: 18 }}>
          Shrimp PL Quality Certificate
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>รหัสล็อต</Text>
          <Text style={styles.metaValue}>{batch.id}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>วันที่ลงไข่</Text>
          <Text style={styles.metaValue}>{batch.date}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>สายพันธุ์</Text>
          <Text style={styles.metaValue}>{batch.source}</Text>
        </View>

        <Text style={styles.sectionTitle}>ผลตรวจ PCR</Text>
        <View style={[styles.pcrRow, { backgroundColor: '#F4F5F8' }]}>
          <Text style={styles.pcrCell}>โรค</Text>
          <Text style={styles.pcrCell}>ผล</Text>
          <Text style={styles.pcrCell}>ห้องปฏิบัติการ</Text>
          <Text style={styles.pcrCell}>วันที่ตรวจ</Text>
        </View>
        {batch.pcrResults.length === 0 ? (
          <Text style={{ paddingVertical: 8, color: '#6B7280' }}>
            ยังไม่มีผลตรวจ PCR
          </Text>
        ) : (
          batch.pcrResults.map((p) => (
            <View key={p.id} style={styles.pcrRow}>
              <Text style={styles.pcrCell}>{p.disease}</Text>
              <Text style={styles.pcrCell}>{statusTh(p.status)}</Text>
              <Text style={styles.pcrCell}>{p.lab ?? '—'}</Text>
              <Text style={styles.pcrCell}>{p.testedOn ?? '—'}</Text>
            </View>
          ))
        )}

        <View style={styles.footer}>
          <Text style={styles.stamp}>รับรองโดย AquaWise</Text>
          <Text style={{ color: '#6B7280' }}>
            ออกเอกสารวันที่ {generatedAt}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Server-only: render the PCR certificate to a PDF Buffer. Returns a Buffer
 * whose first 4 bytes are `%PDF`.
 */
export async function renderPcrCertPdf(
  batch: BatchDetail,
  brand: NurseryBrand
): Promise<Buffer> {
  ensureFonts();
  return renderToBuffer(<PcrCertDocument batch={batch} brand={brand} />);
}
