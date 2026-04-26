/* global React */

// === V2.1 Dashboard — Thai-first hatchery operating tool ===
function V2Dashboard({ setPage }) {
  const D = window.AW_DATA;
  const today = new Date('2026-04-26');
  const dateStr = today.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const restockNow = D.CUSTOMERS.filter(c => c.restockIn === 0);
  const restockSoon = D.CUSTOMERS.filter(c => c.restockIn != null && c.restockIn > 0 && c.restockIn <= 14);
  const concerns = D.CUSTOMERS.filter(c => c.status === 'concern');
  const activeBatches = D.BATCHES.slice(0, 4);

  return (
    <div style={{ padding: '24px', maxWidth: 1440, margin: '0 auto' }}>
      {/* Top greeting line — short, useful */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>สวัสดี คุณสุเทพ</h1>
          <div className="label" style={{ marginTop: 4 }}>{dateStr} · สมุทรสาคร 28°C ลม NE 9 น็อต</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="aw-btn aw-btn-ghost aw-btn-sm">ส่งข้อความถึงลูกค้าทุกคน</button>
          <button className="aw-btn aw-btn-blue aw-btn-sm">+ ลงทะเบียนล็อตใหม่</button>
        </div>
      </div>

      {/* Today's action items — the most important thing */}
      <Card pad={0} style={{ marginBottom: 20, background: 'var(--aw-ink)', color: '#fff', border: 0 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>วันนี้ต้องทำ · {restockNow.length + concerns.length + 2} เรื่อง</span>
          <span className="label-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>TODO · 26 APR</span>
        </div>
        <div>
          {[
            ...restockNow.map(c => ({ icon: '☎', th: `โทรหา ${c.name} (${c.farm}) — ครบรอบเก็บแล้ว ควรสั่งลูกกุ้งใหม่`, action: 'ดูประวัติ', kind: 'restock', cid: c.id })),
            ...concerns.map(c => ({ icon: '⚠', th: `ติดตาม ${c.farm} — D30 อยู่ที่ ${c.d30}% ต่ำกว่าค่าเฉลี่ยล็อต 84%`, action: 'เปิดเคส', kind: 'concern', cid: c.id })),
            { icon: '✓', th: 'ตอบคำถามจาก พงษ์ศรีฟาร์ม เรื่องโควตล็อตหน้า (1.2M PL)', action: 'เปิด LINE', kind: 'msg' },
            { icon: '📋', th: 'รับผล PCR ล็อต B-2604-D จากแล็บ (คาดว่าวันนี้ก่อน 17:00)', action: 'แจ้งเมื่อพร้อม', kind: 'lab' },
          ].map((t, i, arr) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '36px 1fr auto',
              padding: '14px 18px', alignItems: 'center', gap: 12,
              borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 0,
            }}>
              <span style={{ fontSize: 16, opacity: 0.85 }}>{t.icon}</span>
              <span style={{ fontSize: 14, lineHeight: 1.5 }}>{t.th}</span>
              <button onClick={() => t.cid && setPage('customers')} style={{
                background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
                fontFamily: 'var(--font-thai)', fontSize: 12, fontWeight: 500,
                padding: '6px 10px', cursor: 'pointer',
              }}>{t.action} →</button>
            </div>
          ))}
        </div>
      </Card>

      {/* Stat row — the numbers that matter today */}
      <Grid cols={12} gap={1} style={{ marginBottom: 24, background: 'var(--aw-line-2)', border: '1px solid var(--aw-line-2)' }}>
        {[
          { label: 'ลูกค้าใช้งานอยู่', value: '47', sub: '+3 เดือนนี้' },
          { label: 'ล็อตที่ยังตามผลอยู่', value: '4', sub: '6 ฟาร์ม รายงาน' },
          { label: 'PL ขายแล้วไตรมาสนี้', value: '9.3', unit: 'M', sub: '+18% YoY' },
          { label: 'รายได้เดือนนี้', value: '2.1', unit: 'M฿', sub: 'เป้าหมาย 2.5M', accent: 'var(--aw-blue)' },
          { label: 'D30 เฉลี่ยล็อต Q2', value: '82', unit: '%', sub: '+6 จาก Q1', accent: 'var(--aw-good)' },
          { label: 'รอบใหม่ใน 14 วัน', value: '3', sub: 'ฟาร์ม', accent: 'var(--aw-flame)' },
        ].map((s, i) => (
          <div key={i} style={{ gridColumn: 'span 2', background: 'var(--aw-card)', padding: 16 }}>
            <Stat {...s} big/>
          </div>
        ))}
      </Grid>

      {/* Two columns: batches + activity */}
      <Grid cols={12} gap={20} style={{ marginBottom: 24 }}>
        <Col span={7}>
          <Section title="ล็อตที่ยังตามผลอยู่" meta={`${activeBatches.length} ACTIVE`}
            action={<button onClick={() => setPage('batches')} className="aw-btn aw-btn-ghost aw-btn-sm">ดูทั้งหมด <Arrow/></button>}>
            <div style={{ border: 'var(--hairline-2)' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '120px 1fr 80px 60px 80px 80px',
                padding: '10px 14px', borderBottom: 'var(--hairline-2)',
                background: 'var(--aw-bg-2)',
              }}>
                {['ล็อต', 'สายพันธุ์', 'PCR', 'ฟาร์ม', 'D30 เฉลี่ย', 'แนวโน้ม'].map(h => (
                  <span key={h} className="label-mono">{h}</span>
                ))}
              </div>
              {activeBatches.map((b, i) => (
                <div key={b.id} className="aw-row" style={{
                  display: 'grid', gridTemplateColumns: '120px 1fr 80px 60px 80px 80px',
                  padding: '14px', alignItems: 'center', gap: 8,
                  borderBottom: i < activeBatches.length - 1 ? 'var(--hairline-3)' : 0,
                }}>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{b.id}</span>
                  <span style={{ fontSize: 13 }}>{b.source}</span>
                  <Pill tone={b.pcr === 'clean' ? 'good' : 'bad'} size="xs">{b.pcr === 'clean' ? 'สะอาด' : 'พบเชื้อ'}</Pill>
                  <span className="mono" style={{ fontSize: 13 }}>{b.farms}</span>
                  <span className="mono" style={{ fontSize: 15, fontWeight: 600, color: b.meanD30 < 75 ? 'var(--aw-bad)' : 'var(--aw-ink)' }}>{b.meanD30}%</span>
                  <Bar values={b.dist} height={24} accent={b.pcr === 'flagged' ? 'var(--aw-bad)' : 'var(--aw-ink)'}/>
                </div>
              ))}
            </div>
          </Section>
        </Col>

        <Col span={5}>
          <Section title="กิจกรรมจากฟาร์ม" meta="LIVE FEED"
            action={<span style={{ fontSize: 12, color: 'var(--aw-good)', display: 'flex', alignItems: 'center' }}><LiveDot/>กำลังรับ</span>}>
            <div style={{ border: 'var(--hairline-2)' }}>
              {[
                { t: '14:22', who: 'บ้านสวน', what: 'รายงาน D30 = 84% (แซมเปิล 1,500 ตัว)', tone: 'good' },
                { t: '13:08', who: 'พงษ์ศรี', what: 'สอบถามราคาล็อตหน้า · 1.2M PL', tone: 'blueTint' },
                { t: '11:45', who: 'สุขสบาย', what: 'อัปเดตวันที่ 35 · pH 7.8 · DO 5.4', tone: 'neutral' },
                { t: '10:12', who: 'ทองสุข', what: 'แจ้งเตือน DO ต่ำ 3.1 · แก้ได้ตอน 14:30', tone: 'bad' },
                { t: '09:30', who: 'มั่นคง', what: 'จับขายแล้ว 3.8 ตัน · ขนาด 55ct', tone: 'good' },
                { t: '08:15', who: 'รุ่งเรือง 2', what: 'ใกล้สั่งรอบใหม่ · เหลือ 4 วัน', tone: 'warn' },
              ].map((a, i, arr) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '50px 1fr',
                  padding: '12px 14px', alignItems: 'flex-start', gap: 12,
                  borderBottom: i < arr.length - 1 ? 'var(--hairline-3)' : 0,
                }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--aw-ink-3)', paddingTop: 2 }}>{a.t}</span>
                  <div>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                      <strong style={{ fontWeight: 600 }}>{a.who}</strong> · {a.what}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </Col>
      </Grid>

      {/* Market prices */}
      <Section title="ราคากุ้งหน้าตลาดวันนี้" meta={`${D.PRICES.source.toUpperCase()} · ${D.PRICES.date}`}>
        <Grid cols={5} gap={1} style={{ background: 'var(--aw-line-2)', border: '1px solid var(--aw-line-2)' }}>
          {D.PRICES.rows.map((r, i) => (
            <div key={r.size} style={{ background: 'var(--aw-card)', padding: 16 }}>
              <div className="label" style={{ marginBottom: 6 }}>ขนาด {r.size} ตัว/กก.</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span className="mono" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>{r.price}</span>
                <span className="label-mono">฿/กก.</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: r.delta > 0 ? 'var(--aw-good)' : r.delta < 0 ? 'var(--aw-bad)' : 'var(--aw-ink-3)',
                }}>
                  {r.delta > 0 ? '↑' : r.delta < 0 ? '↓' : '—'} {r.delta !== 0 && Math.abs(r.delta)}
                </span>
                <span className="label-mono">3Y AVG {r.avg3y}</span>
              </div>
            </div>
          ))}
        </Grid>
      </Section>

      {/* Restock + concern split */}
      <Grid cols={12} gap={20}>
        <Col span={7}>
          <Section title="ฟาร์มที่ใกล้สั่งรอบใหม่" meta={`${restockSoon.length + restockNow.length} ฟาร์ม · 14 วัน`}
            action={<button onClick={() => setPage('restock')} className="aw-btn aw-btn-ghost aw-btn-sm">ดูทั้งหมด <Arrow/></button>}>
            <div>
              {[...restockNow, ...restockSoon].slice(0, 4).map((c, i, arr) => (
                <Card key={c.id} hover onClick={() => setPage('customers')}
                  style={{ marginBottom: 8, padding: 14, display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 14, alignItems: 'center', borderLeft: c.restockIn === 0 ? '3px solid var(--aw-flame)' : '3px solid var(--aw-blue)' }}>
                  <div style={{ width: 56, textAlign: 'center' }}>
                    <div className="mono" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, color: c.restockIn === 0 ? 'var(--aw-flame)' : 'var(--aw-ink)' }}>
                      {c.restockIn === 0 ? 'NOW' : c.restockIn}
                    </div>
                    {c.restockIn !== 0 && <div className="label-mono">วัน</div>}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{c.farm}</div>
                    <div className="label" style={{ marginTop: 2 }}>
                      {c.name} · {c.zone} · ครบรอบล่าสุด D{c.cycleDay} · เคยสั่งเฉลี่ย {(c.ltv / c.batches / 1000).toFixed(0)}k PL
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="label-mono">D30 / D60</div>
                    <div className="mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{c.d30 ?? '—'} / {c.d60 ?? '—'}</div>
                  </div>
                  <button className="aw-btn aw-btn-sm aw-btn-blue">ส่ง LINE</button>
                </Card>
              ))}
            </div>
          </Section>
        </Col>

        <Col span={5}>
          <Section title="ฟาร์มที่ต้องดูแลใกล้ชิด" meta="OUTLIERS">
            {concerns.length > 0 ? (
              <Card style={{ background: 'var(--aw-bad-tint)', borderColor: 'var(--aw-bad)' }} pad={20}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 17, fontWeight: 600 }}>{concerns[0].farm}</span>
                  <Pill tone="bad">D30 = {concerns[0].d30}%</Pill>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--aw-ink-2)' }}>
                  ต่ำกว่าค่าเฉลี่ยล็อต <strong>84%</strong> อยู่ {84 - concerns[0].d30} จุด · รอบที่ {concerns[0].cycleDay} วัน
                  <br/><br/>
                  <strong>สาเหตุที่น่าจะเป็น:</strong> DO ต่ำตอนกลางคืน, ความเค็มลดหลังฝนเดือน เม.ย.
                  <br/>
                  <strong>เคยแก้ไข:</strong> เพิ่มตัวให้ออกซิเจน, ตรวจ pH ทุก 3 ชม.
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="aw-btn aw-btn-sm">โทร {concerns[0].name}</button>
                  <button className="aw-btn aw-btn-sm aw-btn-ghost">เปิดเคสในระบบ</button>
                </div>
              </Card>
            ) : (
              <Card pad={20}><span className="label">ไม่มีฟาร์มผิดปกติในขณะนี้</span></Card>
            )}

            <Card pad={16} style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="label-mono">เฝ้าระวังโรค</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                  <LiveDot tone="good"/> ไม่มีการแจ้งเตือน
                </div>
                <div className="label" style={{ marginTop: 4 }}>สแกน EHP/WSSV ครั้งล่าสุด 3 วันก่อน</div>
              </div>
              <button onClick={() => setPage('alerts')} className="aw-btn aw-btn-ghost aw-btn-sm">ดูประวัติ <Arrow/></button>
            </Card>
          </Section>
        </Col>
      </Grid>
    </div>
  );
}

window.V2Dashboard = V2Dashboard;
