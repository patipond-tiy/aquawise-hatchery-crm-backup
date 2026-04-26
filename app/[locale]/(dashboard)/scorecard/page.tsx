'use client';

import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getScorecardSettings,
  updateScorecardSettings,
} from '@/lib/api';
import { V3Card } from '@/components/aw/v3-card';
import { V3Grid, V3Col } from '@/components/aw/v3-grid';
import { V3Mark } from '@/components/aw/v3-mark';
import { Toggle } from '@/components/modals/modal-shell';

const STATS_ROWS = [
  { label: 'อัตรารอด D30', val: 'สูงกว่ามัธยฐาน', accent: 'good' },
  { label: 'ผ่าน PCR (4 โรค)', val: '100%', accent: 'good' },
  { label: 'ฟาร์มที่กลับมาซื้อ', val: '78%', accent: 'good' },
  { label: 'เฉลี่ย 12 ล็อต / 47 ฟาร์ม', val: '', accent: 'soft' },
] as const;

const CONTROLS = [
  {
    key: 'showD30',
    label: 'อัตรารอด D30',
    desc: 'แสดงเป็นข้อความ "สูงกว่ามัธยฐาน" ไม่ใช่ตัวเลข',
  },
  {
    key: 'showPCR',
    label: 'ผลตรวจ PCR',
    desc: 'ผ่าน 4 โรค WSSV / EHP / IHHNV / TSV',
  },
  {
    key: 'showRetention',
    label: 'อัตราการกลับมาซื้อ',
    desc: 'ลูกค้าที่สั่งล็อตที่ 2 ภายใน 6 เดือน',
  },
  {
    key: 'showVolume',
    label: 'จำนวนฟาร์มและล็อต',
    desc: 'แสดงเฉพาะค่ารวม ไม่ระบุชื่อ',
  },
  {
    key: 'showReviews',
    label: 'รีวิวจากลูกค้า',
    desc: 'ยังไม่เปิด — รอเฟส 2',
  },
] as const;

export default function ScorecardPage() {
  const qc = useQueryClient();
  const { data: scorecard } = useQuery({
    queryKey: ['scorecard'],
    queryFn: getScorecardSettings,
  });
  const mutation = useMutation({
    mutationFn: updateScorecardSettings,
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: ['scorecard'] });
      const prev = qc.getQueryData(['scorecard']);
      qc.setQueryData(['scorecard'], (s: typeof scorecard) =>
        s ? { ...s, ...patch } : s
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['scorecard'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['scorecard'] }),
  });

  if (!scorecard) {
    return <div style={{ padding: 40, color: 'var(--color-ink-4)' }}>กำลังโหลด…</div>;
  }

  const setPub = (v: boolean) => mutation.mutate({ public: v });
  const setKey = (key: string, v: boolean) =>
    mutation.mutate({ [key]: v } as Partial<typeof scorecard>);

  return (
    <div>
      <h1
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.01em',
        }}
      >
        คะแนนสาธารณะ
      </h1>
      <div
        style={{
          color: 'var(--color-ink-3)',
          fontSize: 15,
          marginBottom: 24,
          marginTop: 4,
        }}
      >
        โปรไฟล์ที่ลูกค้ารายใหม่จะเห็นเมื่อสแกน QR หน้าตู้
      </div>

      <V3Grid cols={12} gap={20}>
        <V3Col span={5}>
          <V3Card
            pad={0}
            style={{
              border: '1px solid var(--color-line)',
              background: 'linear-gradient(180deg, #F0F4FC 0%, #fff 30%)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '32px 28px 0', textAlign: 'center' }}>
              <div style={{ display: 'inline-block' }}>
                <V3Mark size={56} />
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  color: 'var(--color-hero)',
                  marginTop: 14,
                  textTransform: 'uppercase',
                }}
              >
                AquaWise verified
              </div>
              <h2
                style={{
                  margin: '14px 0 4px',
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                }}
              >
                ฟ้าใส แฮทเชอรี่
              </h2>
              <div style={{ fontSize: 13, color: 'var(--color-ink-3)' }}>
                สมุทรสาคร · เปิดมาแล้ว 8 ปี
              </div>

              <div
                style={{
                  margin: '24px auto 0',
                  padding: '20px 22px',
                  background: '#fff',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 4px 14px rgba(20,19,31,0.06)',
                  textAlign: 'left',
                }}
              >
                <div className="eyebrow" style={{ marginBottom: 14 }}>
                  ผลงาน 6 เดือนล่าสุด
                </div>
                {STATS_ROWS.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom:
                        i < STATS_ROWS.length - 1
                          ? '1px solid var(--color-line)'
                          : 0,
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'var(--color-ink-3)' }}>
                      {r.label}
                    </span>
                    {r.val && (
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color:
                            r.accent === 'good'
                              ? 'var(--color-good)'
                              : 'var(--color-ink)',
                        }}
                      >
                        {r.val}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div
                style={{
                  margin: '20px 0 28px',
                  padding: '12px 18px',
                  background: 'var(--color-soft)',
                  borderRadius: 'var(--radius)',
                  fontSize: 11.5,
                  color: 'var(--color-ink-4)',
                  lineHeight: 1.5,
                  textAlign: 'left',
                }}
              >
                ข้อมูลจาก AquaWise — ไม่แสดงอันดับเทียบฟาร์มอื่น และไม่แสดงค่าที่ต่ำกว่ามัธยฐาน
              </div>
            </div>
          </V3Card>
          <div
            style={{
              marginTop: 12,
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--color-ink-4)',
              fontWeight: 600,
            }}
          >
            ตัวอย่างที่ลูกค้าเห็นเมื่อสแกน
          </div>
        </V3Col>

        <V3Col span={7}>
          <V3Card pad={20} style={{ border: '1px solid var(--color-line)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  เปิดให้สาธารณะดู
                </h3>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--color-ink-3)',
                    marginTop: 4,
                  }}
                >
                  ลูกค้าที่สแกน QR จะเห็นข้อมูลด้านซ้าย
                </div>
              </div>
              <Toggle on={scorecard.public} onChange={setPub} />
            </div>
          </V3Card>

          <V3Card pad={22} style={{ border: '1px solid var(--color-line)', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              สถิติที่แสดง
            </h3>
            <div
              style={{
                fontSize: 12.5,
                color: 'var(--color-ink-3)',
                marginTop: 4,
                marginBottom: 14,
              }}
            >
              เปิด/ปิดได้ตามต้องการ — แต่เราจะไม่แสดงค่าต่ำกว่ามัธยฐานให้เห็นเลย
            </div>
            {CONTROLS.map((r, i) => (
              <div
                key={r.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 0',
                  borderTop: i > 0 ? '1px solid var(--color-line)' : 0,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{r.label}</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--color-ink-4)',
                      marginTop: 2,
                    }}
                  >
                    {r.desc}
                  </div>
                </div>
                <Toggle
                  on={Boolean(scorecard[r.key as keyof typeof scorecard])}
                  onChange={(v) => setKey(r.key, v)}
                  size="sm"
                />
              </div>
            ))}
          </V3Card>

          <V3Card pad={22} style={{ border: '1px solid var(--color-line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 'var(--radius)',
                  background: 'var(--color-soft)',
                  padding: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg viewBox="0 0 80 80" width="100%" height="100%">
                  {Array.from({ length: 7 }).map((_, r) =>
                    Array.from({ length: 7 }).map((_, c) => {
                      const seed = (r * 7 + c * 3 + 11) % 5;
                      return seed > 1 ? (
                        <rect
                          key={`${r}-${c}`}
                          x={r * 10 + 5}
                          y={c * 10 + 5}
                          width="9"
                          height="9"
                          fill="var(--color-ink)"
                        />
                      ) : null;
                    })
                  )}
                  <rect x="0" y="0" width="22" height="22" fill="none" stroke="var(--color-ink)" strokeWidth="3" />
                  <rect x="58" y="0" width="22" height="22" fill="none" stroke="var(--color-ink)" strokeWidth="3" />
                  <rect x="0" y="58" width="22" height="22" fill="none" stroke="var(--color-ink)" strokeWidth="3" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>QR หน้าตู้</h3>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--color-ink-3)',
                    marginTop: 4,
                  }}
                >
                  ลูกค้าใหม่สแกนเพื่อดูโปรไฟล์ + เพิ่มเป็นเพื่อน LINE
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    type="button"
                    className="aw3-btn aw3-btn-soft aw3-btn-sm"
                    onClick={() => toast.success('ดาวน์โหลด PDF แล้ว')}
                  >
                    ดาวน์โหลด PDF
                  </button>
                  <button
                    type="button"
                    className="aw3-btn aw3-btn-ghost aw3-btn-sm"
                    onClick={() => toast.success('ส่งทาง LINE แล้ว')}
                  >
                    ส่ง LINE
                  </button>
                </div>
              </div>
            </div>
          </V3Card>
        </V3Col>
      </V3Grid>
    </div>
  );
}
