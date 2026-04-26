/* global React */

// V2.1 — Restock predictor, Disease alerts, Public scorecard, Settings
// Thai-first, hairline tool aesthetic matching v2-batches.

// === Restock Predictor ===
function V2Restock({ setPage, setCustomerId }) {
  const D = window.AW_DATA;
  const today = D.CUSTOMERS.filter(c => c.restockIn === 0);
  const week = D.CUSTOMERS.filter(c => c.restockIn != null && c.restockIn > 0 && c.restockIn <= 14);
  const month = D.CUSTOMERS.filter(c => c.restockIn != null && c.restockIn > 14 && c.restockIn <= 45);
  const later = D.CUSTOMERS.filter(c => c.restockIn != null && c.restockIn > 45);

  const Group = ({ title, items, urgent }) => {
    if (!items.length) return (
      <Section title={title} meta="0 ฟาร์ม">
        <div style={{ background: 'var(--aw-card)', border: '1px solid var(--aw-line-2)', padding: 24, color: 'var(--aw-ink-4)', fontSize: 13 }}>
          ยังไม่มีฟาร์มในกลุ่มนี้
        </div>
      </Section>
    );
    return (
      <Section title={title} meta={`${items.length} ฟาร์ม`}>
        <div style={{ background: 'var(--aw-card)', border: '1px solid var(--aw-line-2)' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '90px 60px 2fr 110px 1.4fr 130px 50px',
            padding: '10px 14px', borderBottom: 'var(--hairline-2)', background: 'var(--aw-bg-2)',
          }}>
            {['เมื่อไหร่', 'ID', 'ฟาร์ม', 'ล็อตที่แล้ว', 'ความมั่นใจ', '', ''].map((h, i) => (
              <span key={i} className="label-mono">{h}</span>
            ))}
          </div>
          {items.map((c, i) => {
            const conf = 78 - (c.id.charCodeAt(3) % 12);
            return (
              <div key={c.id} className="aw-row" onClick={() => { setCustomerId(c.id); setPage('customer'); }}
                style={{
                  display: 'grid', gridTemplateColumns: '90px 60px 2fr 110px 1.4fr 130px 50px',
                  padding: '14px', alignItems: 'center', gap: 8,
                  borderBottom: i < items.length - 1 ? 'var(--hairline-3)' : 0,
                  background: urgent && i < 1 ? 'var(--aw-bad-tint)' : 'transparent',
                }}>
                <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: c.restockIn === 0 ? 'var(--aw-bad)' : 'var(--aw-ink)' }}>
                  {c.restockIn === 0 ? 'ตอนนี้' : `+${c.restockIn} วัน`}
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--aw-ink-3)' }}>{c.id}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.farm}</div>
                  <div className="label">{c.name} · {c.zone}</div>
                </div>
                <span className="mono" style={{ fontSize: 13 }}>{(c.ltv / c.batches / 1000).toFixed(0)}k PL</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 6, background: 'var(--aw-bg-2)' }}>
                    <div style={{ width: `${conf}%`, height: '100%', background: 'var(--aw-blue)' }}/>
                  </div>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>{conf}%</span>
                </div>
                <button onClick={(e) => e.stopPropagation()} className="aw-btn aw-btn-blue aw-btn-sm">ติดต่อ</button>
                <span style={{ textAlign: 'right', color: 'var(--aw-ink-4)' }}><Arrow/></span>
              </div>
            );
          })}
        </div>
      </Section>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1440, margin: '0 auto' }}>
      <Grid cols={12} gap={20} style={{ marginBottom: 24 }}>
        <Col span={9}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>คาดการณ์รอบใหม่</h1>
          <div className="label" style={{ marginTop: 6, fontSize: 14 }}>
            ใครต้องการลูกกุ้งรอบใหม่ และเมื่อไหร่ — โมเดลจากวันเลี้ยง + รอบสั่งซื้อ + ช่วงจับขาย
          </div>
        </Col>
        <Col span={3}>
          <Card pad={16} style={{ background: 'var(--aw-blue-tint)', border: '1px solid var(--aw-blue)', height: '100%' }}>
            <div className="label-mono" style={{ color: 'var(--aw-blue-2)' }}>โมเดล</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, color: 'var(--aw-blue-2)' }}>
              อัพเดททุก 1 ชั่วโมง · ดูย้อนหลัง 5 รอบ
            </div>
          </Card>
        </Col>
      </Grid>

      <Grid cols={12} gap={1} style={{ background: 'var(--aw-line-2)', border: '1px solid var(--aw-line-2)', marginBottom: 36 }}>
        {[
          { label: 'ตอนนี้', value: today.length, unit: 'ฟาร์ม', accent: today.length ? 'var(--aw-bad)' : undefined },
          { label: 'ใน 14 วัน', value: week.length, unit: 'ฟาร์ม', accent: 'var(--aw-warn)' },
          { label: 'ในเดือนนี้', value: month.length, unit: 'ฟาร์ม' },
          { label: 'ภายหลัง', value: later.length, unit: 'ฟาร์ม' },
        ].map((s, i) => (
          <div key={i} style={{ gridColumn: 'span 3', background: 'var(--aw-card)', padding: 16 }}>
            <Stat {...s} big/>
          </div>
        ))}
      </Grid>

      <Group title="ตอนนี้ — ติดต่อด่วน" items={today} urgent/>
      <Group title="ภายใน 14 วัน" items={week}/>
      <Group title="ภายในเดือนนี้" items={month}/>
      <Group title="ภายหลัง" items={later}/>
    </div>
  );
}

// === Disease Alerts ===
function V2Alerts({ setPage }) {
  const RESOLVED = [
    { id: 'AL-2604-02', date: '22 เม.ย. 2026', pathogen: 'EHP', th: 'แคระ EHP', batch: 'B-2604-A', farms: 1, severity: 'low', resolved: '2 วัน' },
    { id: 'AL-2604-01', date: '14 เม.ย. 2026', pathogen: 'WSSV scare', th: 'สงสัยจุดขาว', batch: 'B-2603-D', farms: 2, severity: 'medium', resolved: '4 วัน' },
    { id: 'AL-2603-04', date: '30 มี.ค. 2026', pathogen: 'TSV', th: 'TSV', batch: 'B-2603-D', farms: 1, severity: 'medium', resolved: '6 วัน' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1440, margin: '0 auto' }}>
      <Grid cols={12} gap={20} style={{ marginBottom: 24 }}>
        <Col span={9}>
          <div className="label-mono">เฉพาะภายใน · ไม่เผยแพร่</div>
          <h1 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 700 }}>แจ้งเตือนโรค</h1>
          <div className="label" style={{ marginTop: 6, fontSize: 14 }}>
            ตามลูกกุ้งย้อนกลับ — ถ้าฟาร์ม 2+ แห่งจากล็อตเดียวกันแจ้งอาการ ระบบจะเตือน
          </div>
        </Col>
        <Col span={3} style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="aw-btn aw-btn-ghost" style={{ width: '100%', justifyContent: 'space-between' }}>ตั้งค่าเกณฑ์ <Arrow/></button>
        </Col>
      </Grid>

      <Grid cols={12} gap={1} style={{ background: 'var(--aw-line-2)', border: '1px solid var(--aw-line-2)', marginBottom: 36 }}>
        {[
          { label: 'แจ้งเตือนที่กำลังเปิด', value: 0, unit: 'รายการ', accent: 'var(--aw-good)' },
          { label: 'วันตั้งแต่เตือนล่าสุด', value: 3, unit: 'วัน' },
          { label: 'ปิดเคสปีนี้', value: 14, unit: 'เคส' },
          { label: 'ครอบคลุมการตรวจสอบ', value: 92, unit: '%' },
        ].map((s, i) => (
          <div key={i} style={{ gridColumn: 'span 3', background: 'var(--aw-card)', padding: 16 }}>
            <Stat {...s} big/>
          </div>
        ))}
      </Grid>

      <Section title="ปิดเคสแล้ว · 30 วันล่าสุด" meta={`${RESOLVED.length} เคส`}>
        <div style={{ background: 'var(--aw-card)', border: '1px solid var(--aw-line-2)' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '130px 1.5fr 110px 80px 90px 100px 100px',
            padding: '10px 14px', borderBottom: 'var(--hairline-2)', background: 'var(--aw-bg-2)',
          }}>
            {['ID เคส', 'เชื้อ', 'ล็อต', 'ฟาร์ม', 'ระดับ', 'สถานะ', 'ปิดใน'].map((h, i) => (
              <span key={i} className="label-mono">{h}</span>
            ))}
          </div>
          {RESOLVED.map((a, i) => (
            <div key={a.id} style={{
              display: 'grid', gridTemplateColumns: '130px 1.5fr 110px 80px 90px 100px 100px',
              padding: '14px', alignItems: 'center', gap: 8,
              borderBottom: i < RESOLVED.length - 1 ? 'var(--hairline-3)' : 0,
            }}>
              <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{a.id}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{a.th}</div>
                <div className="label-mono">{a.pathogen} · เปิด {a.date}</div>
              </div>
              <span className="mono" style={{ fontSize: 12 }}>{a.batch}</span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{a.farms} ฟาร์ม</span>
              <Pill tone={a.severity === 'low' ? 'warn' : 'bad'} size="xs">
                {a.severity === 'low' ? 'ต่ำ' : 'กลาง'}
              </Pill>
              <Pill tone="good" size="xs">ปิดแล้ว</Pill>
              <span className="mono" style={{ fontSize: 12, color: 'var(--aw-ink-3)' }}>{a.resolved}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="ตัวอย่าง · ถ้ามีเตือนใหม่" meta="ความรุนแรง สูง">
        <Card pad={0} style={{ borderColor: 'var(--aw-bad)' }}>
          <div style={{ background: 'var(--aw-bad)', color: '#fff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LiveDot tone="bad"/>
              <span className="label-mono" style={{ color: '#fff' }}>เตือนใหม่ · ระดับ สูง</span>
            </div>
            <span className="mono" style={{ fontSize: 11, opacity: 0.85 }}>AL-SAMPLE</span>
          </div>
          <div style={{ padding: 24 }}>
            <Grid cols={12} gap={20}>
              <Col span={8}>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>สงสัย EHP · ล็อต B-2604-X</h3>
                <div style={{ marginTop: 10, fontSize: 14, color: 'var(--aw-ink-2)', lineHeight: 1.6, maxWidth: 560 }}>
                  3 ฟาร์มรายงานการเติบโตช้ากว่าเป้า ผล PCR กำลังตรวจ — ขอแนะนำให้หยุดส่งล็อตนี้, แจ้งเตือน 7 ฟาร์มที่ได้รับลูกกุ้งจากล็อตเดียวกัน, และนัดตรวจซ้ำภายใน 48 ชั่วโมง
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div><div className="label-mono">ฟาร์มที่รายงาน</div><div className="mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>3</div></div>
                  <div><div className="label-mono">ฟาร์มเสี่ยง</div><div className="mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>7</div></div>
                  <div><div className="label-mono">PL ที่ปล่อยไปแล้ว</div><div className="mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>1.6M</div></div>
                </div>
              </Col>
              <Col span={4} style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'flex-end' }}>
                <button className="aw-btn aw-btn-blue" style={{ justifyContent: 'space-between' }}>แจ้งเตือนฟาร์ม <Arrow/></button>
                <button className="aw-btn aw-btn-ghost">หยุดส่งล็อตนี้</button>
                <button className="aw-btn aw-btn-ghost">นัดตรวจ PCR ซ้ำ</button>
              </Col>
            </Grid>
          </div>
        </Card>
      </Section>
    </div>
  );
}

// === Public Scorecard ===
function V2Scorecard({ setPage }) {
  const D = window.AW_DATA;

  return (
    <div style={{ padding: 24, maxWidth: 1440, margin: '0 auto' }}>
      <Grid cols={12} gap={20} style={{ marginBottom: 24 }}>
        <Col span={9}>
          <div className="label-mono">เผยแพร่ได้ · ตรวจสอบได้</div>
          <h1 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 700 }}>คะแนนสาธารณะ</h1>
          <div className="label" style={{ marginTop: 6, fontSize: 14, maxWidth: 600 }}>
            แสดงเฉพาะว่าคุณ "สูงกว่าค่ากลางของภูมิภาค" — ไม่มีอันดับ ไม่มีตารางจัดอันดับ ฟาร์มดูข้อมูลดิบเพื่อยืนยันได้
          </div>
        </Col>
        <Col span={3} style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'flex-end' }}>
          <button className="aw-btn aw-btn-blue" style={{ justifyContent: 'space-between' }}>แชร์ผ่าน LINE <Arrow/></button>
          <button className="aw-btn aw-btn-ghost" style={{ justifyContent: 'center' }}>คัดลอกลิงก์</button>
        </Col>
      </Grid>

      <Section title="ตัวอย่างหน้าสาธารณะ" meta="โปรไฟล์ฟาร์มเห็นแบบนี้">
        <div style={{ background: 'var(--aw-ink)', color: '#fff', padding: 40 }}>
          <Grid cols={12} gap={32}>
            <Col span={7}>
              <div className="label-mono" style={{ color: 'var(--aw-ink-5)' }}>ตรวจสอบโดย AquaWise · ไตรมาส 2/2569</div>
              <h2 style={{ margin: '14px 0 0', fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
                ฟ้าใส<br/>แฮทเชอรี่<span style={{ color: 'var(--aw-acid)' }}>.</span>
              </h2>
              <div style={{ marginTop: 14, fontSize: 15, opacity: 0.8 }}>
                {D.HATCHERY.nameEn} · สมุทรสาคร · ดำเนินการตั้งแต่ 2561
              </div>
            </Col>
            <Col span={5} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
              {/* Verification stamp */}
              <div style={{
                width: 140, height: 140, position: 'relative',
                border: '2px solid var(--aw-acid)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
              }}>
                <div className="label-mono" style={{ color: 'var(--aw-acid)', fontSize: 9 }}>ABOVE</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--aw-acid)', letterSpacing: '-0.02em' }}>MEDIAN</div>
                <div className="label-mono" style={{ color: '#fff', fontSize: 9, marginTop: 6, opacity: 0.7 }}>Q2 · 2026</div>
              </div>
            </Col>
          </Grid>

          <div style={{
            marginTop: 40,
            borderTop: '1px solid rgba(255,255,255,0.18)',
            borderBottom: '1px solid rgba(255,255,255,0.18)',
            padding: '28px 0',
          }}>
            <Grid cols={12} gap={32}>
              {[
                { label: 'D30 อัตรารอด เฉลี่ย', value: '82', unit: '%', sub: 'ค่ากลางภูมิภาค 71% · สูงกว่า' },
                { label: 'PCR สะอาด', value: '96', unit: '%', sub: '24 จาก 25 ล็อต · สูงกว่า' },
                { label: 'ลูกค้าซื้อซ้ำ', value: '89', unit: '%', sub: '42 จาก 47 ฟาร์ม · สูงกว่า' },
              ].map((s, i) => (
                <Col key={i} span={4}>
                  <div className="label-mono" style={{ color: 'var(--aw-ink-5)' }}>{s.label}</div>
                  <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 64, fontWeight: 600, lineHeight: 1, color: 'var(--aw-acid)', letterSpacing: '-0.02em' }}>
                    {s.value}<span style={{ fontSize: 24, color: '#fff', marginLeft: 4 }}>{s.unit}</span>
                  </div>
                  <div className="label-mono" style={{ color: 'var(--aw-ink-5)', marginTop: 8 }}>{s.sub}</div>
                </Col>
              ))}
            </Grid>
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <AWMark size={26} color="#fff"/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>ตรวจสอบโดย AquaWise</div>
                <div className="label-mono" style={{ color: 'var(--aw-ink-5)' }}>อิสระ · ไม่มีตารางอันดับ · ข้อมูลตรวจสอบได้</div>
              </div>
            </div>
            <Pill tone="good">เผยแพร่</Pill>
          </div>
        </div>
      </Section>

      <Section title="การตั้งค่า" meta="คุณคุมว่าเปิดเผยอะไร">
        <Card pad={0}>
          {[
            { label: 'แสดง D30 เฉลี่ย', detail: 'แสดงเปอร์เซ็นต์อัตรารอด 30 วัน', on: true },
            { label: 'แสดง PCR clean rate', detail: 'แสดงสัดส่วนล็อตที่สะอาด', on: true },
            { label: 'แสดงอัตราซื้อซ้ำ', detail: 'แสดงเปอร์เซ็นต์ลูกค้ากลับมาซื้อ', on: true },
            { label: 'แสดงรายชื่อลูกค้า', detail: 'แสดงชื่อฟาร์มที่อนุญาต (ขั้นต่ำ 5)', on: false },
            { label: 'อนุญาตให้ดาวน์โหลด PDF', detail: 'ฟาร์มดาวน์โหลดเป็นใบรับรองได้', on: true },
          ].map((n, i, arr) => (
            <div key={n.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px',
              borderBottom: i < arr.length - 1 ? 'var(--hairline-3)' : 0,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{n.label}</div>
                <div className="label" style={{ marginTop: 2 }}>{n.detail}</div>
              </div>
              <div style={{
                width: 40, height: 22, background: n.on ? 'var(--aw-blue)' : 'var(--aw-line-2)',
                position: 'relative', cursor: 'pointer', transition: 'background 0.15s',
              }}>
                <div style={{
                  position: 'absolute', top: 2, [n.on ? 'right' : 'left']: 2,
                  width: 18, height: 18, background: '#fff',
                  transition: 'all 0.15s',
                }}/>
              </div>
            </div>
          ))}
        </Card>
      </Section>
    </div>
  );
}

// === Settings ===
function V2Settings() {
  const SECTIONS = ['โปรไฟล์', 'การแจ้งเตือน', 'คะแนนสาธารณะ', 'LINE OA', 'ทีม', 'ส่งออกข้อมูล', 'การชำระเงิน', 'พื้นที่อันตราย'];

  return (
    <div style={{ padding: 24, maxWidth: 1440, margin: '0 auto' }}>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>ตั้งค่า</h1>
      <div className="label" style={{ marginTop: 6, fontSize: 14, marginBottom: 24 }}>
        ระบบทำงานของฟ้าใส แฮทเชอรี่ — โปรไฟล์, การแจ้งเตือน, ทีมงาน, ข้อมูล
      </div>

      <Grid cols={12} gap={20}>
        <Col span={3}>
          <div style={{ position: 'sticky', top: 80 }}>
            <Card pad={0}>
              {SECTIONS.map((s, i) => (
                <button key={s} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  width: '100%', padding: '12px 14px',
                  border: 0, borderBottom: i < SECTIONS.length - 1 ? 'var(--hairline-3)' : 0,
                  background: i === 0 ? 'var(--aw-ink)' : 'transparent',
                  color: i === 0 ? '#fff' : 'var(--aw-ink)',
                  fontFamily: 'var(--font-thai)', fontSize: 13, fontWeight: 500,
                  textAlign: 'left', cursor: 'pointer',
                }}>
                  <span>{s}</span>
                  {i === 0 && <Arrow/>}
                </button>
              ))}
            </Card>
          </div>
        </Col>

        <Col span={9}>
          <Section title="โปรไฟล์ฟาร์ม" meta="ข้อมูลที่ลูกค้าเห็น">
            <Card pad={20}>
              <Grid cols={12} gap={16}>
                <Col span={6}>
                  <div className="label" style={{ marginBottom: 6 }}>ชื่อภาษาไทย</div>
                  <input className="aw-input" defaultValue="ฟ้าใส แฮทเชอรี่"/>
                </Col>
                <Col span={6}>
                  <div className="label" style={{ marginBottom: 6 }}>ชื่อภาษาอังกฤษ</div>
                  <input className="aw-input" defaultValue="Fasai Hatchery"/>
                </Col>
                <Col span={6}>
                  <div className="label" style={{ marginBottom: 6 }}>เจ้าของ</div>
                  <input className="aw-input" defaultValue="สุเทพ วงศ์ชัย"/>
                </Col>
                <Col span={6}>
                  <div className="label" style={{ marginBottom: 6 }}>จังหวัด</div>
                  <input className="aw-input" defaultValue="สมุทรสาคร"/>
                </Col>
                <Col span={12}>
                  <div className="label" style={{ marginBottom: 6 }}>คำอธิบายที่แสดงให้ลูกค้า</div>
                  <input className="aw-input" defaultValue="ลูกกุ้ง PCR สะอาด ตามรอบได้ ดำเนินการตั้งแต่ 2561"/>
                </Col>
              </Grid>
            </Card>
          </Section>

          <Section title="การแจ้งเตือน" meta="จะเด้งเมื่อไหร่">
            <Card pad={0}>
              {[
                { label: 'ฟาร์มรายงาน D30 อัตรารอด', detail: 'แจ้งภายใน 1 ชั่วโมง', on: true },
                { label: 'ฟาร์มแจ้งกุ้งเครียด', detail: 'ทันที · push + LINE', on: true },
                { label: 'หน้าต่างรอบใหม่เปิด', detail: 'สรุปรายวันเวลา 08:00', on: true },
                { label: 'ผล PCR พร้อม', detail: 'จาก lab webhook · ทันที', on: true },
                { label: 'อัพเดตข้อมูลข้ามฟาร์ม', detail: 'ทุกวันจันทร์ 09:00', on: false },
              ].map((n, i, arr) => (
                <div key={n.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 20px',
                  borderBottom: i < arr.length - 1 ? 'var(--hairline-3)' : 0,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{n.label}</div>
                    <div className="label" style={{ marginTop: 2 }}>{n.detail}</div>
                  </div>
                  <div style={{
                    width: 40, height: 22, background: n.on ? 'var(--aw-blue)' : 'var(--aw-line-2)',
                    position: 'relative', cursor: 'pointer', transition: 'background 0.15s',
                  }}>
                    <div style={{
                      position: 'absolute', top: 2, [n.on ? 'right' : 'left']: 2,
                      width: 18, height: 18, background: '#fff',
                      transition: 'all 0.15s',
                    }}/>
                  </div>
                </div>
              ))}
            </Card>
          </Section>

          <Section title="ส่งออกข้อมูล" meta="ข้อมูลของคุณ ดาวน์โหลดได้">
            <Card pad={20}>
              <div style={{ fontSize: 14, color: 'var(--aw-ink-2)', marginBottom: 14 }}>
                ส่งออกข้อมูลล็อต, ลูกค้า, ประวัติ PCR, รายงานอัตรารอด เป็น CSV หรือ PDF เพื่อสำรอง หรือนำไปใช้กับระบบอื่น
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="aw-btn aw-btn-ghost">ส่งออกล็อต (CSV)</button>
                <button className="aw-btn aw-btn-ghost">ส่งออกลูกค้า (CSV)</button>
                <button className="aw-btn aw-btn-ghost">รายงานรวมไตรมาส (PDF)</button>
              </div>
            </Card>
          </Section>
        </Col>
      </Grid>
    </div>
  );
}

window.V2Restock = V2Restock;
window.V2Alerts = V2Alerts;
window.V2Scorecard = V2Scorecard;
window.V2Settings = V2Settings;
