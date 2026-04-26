/* global React */
const { useState: _v2bs } = React;

// === V2.1 Batches list ===
function V2Batches({ setPage, setBatchId }) {
  const D = window.AW_DATA;
  const totalPL = D.BATCHES.reduce((s, b) => s + b.plProduced, 0);
  const meanD30 = (D.BATCHES.reduce((s, b) => s + b.meanD30, 0) / D.BATCHES.length).toFixed(0);

  return (
    <div style={{ padding: 24, maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>ล็อตลูกกุ้ง</h1>
        <button onClick={() => setPage('batch-register')} className="aw-btn aw-btn-blue aw-btn-sm">+ ลงทะเบียนล็อตใหม่</button>
      </div>
      <div className="label" style={{ marginBottom: 20 }}>
        ไตรมาส 2/2569 · ผลิตแล้ว {(totalPL/1000000).toFixed(1)}M PL · D30 เฉลี่ย {meanD30}%
      </div>

      <Grid cols={12} gap={1} style={{ background: 'var(--aw-line-2)', border: '1px solid var(--aw-line-2)', marginBottom: 24 }}>
        {[
          { label: 'ล็อตที่กำลังตามอยู่', value: D.BATCHES.length, unit: 'ล็อต' },
          { label: 'PL ผลิตทั้งหมด', value: (totalPL/1000000).toFixed(1), unit: 'M' },
          { label: 'D30 เฉลี่ย', value: meanD30, unit: '%', accent: 'var(--aw-good)' },
          { label: 'PCR พบเชื้อ', value: '1', unit: 'ล็อต', accent: 'var(--aw-bad)' },
        ].map((s, i) => (
          <div key={i} style={{ gridColumn: 'span 3', background: 'var(--aw-card)', padding: 16 }}>
            <Stat {...s} big/>
          </div>
        ))}
      </Grid>

      {/* Batches as table — denser than card grid */}
      <div style={{ background: 'var(--aw-card)', border: '1px solid var(--aw-line-2)' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '120px 110px 1.5fr 110px 90px 100px 90px 130px 60px',
          padding: '10px 14px', borderBottom: 'var(--hairline-2)', background: 'var(--aw-bg-2)',
        }}>
          {['ล็อต', 'วันที่ผลิต', 'สายพันธุ์', 'PCR', 'ฟาร์ม', 'PL ขายแล้ว', 'D30 เฉลี่ย', 'การกระจาย D30', ''].map((h, i) => (
            <span key={i} className="label-mono">{h}</span>
          ))}
        </div>
        {D.BATCHES.map((b, i) => (
          <div key={b.id} className="aw-row" onClick={() => { setBatchId(b.id); setPage('batch'); }}
            style={{
              display: 'grid', gridTemplateColumns: '120px 110px 1.5fr 110px 90px 100px 90px 130px 60px',
              padding: '14px', alignItems: 'center', gap: 8,
              borderBottom: i < D.BATCHES.length - 1 ? 'var(--hairline-3)' : 0,
            }}>
            <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{b.id}</span>
            <span className="mono" style={{ fontSize: 12 }}>{b.date}</span>
            <span style={{ fontSize: 13 }}>{b.source}</span>
            <Pill tone={b.pcr === 'clean' ? 'good' : 'bad'} size="xs">
              {b.pcr === 'clean' ? '✓ สะอาด' : '⚠ พบเชื้อ'}
            </Pill>
            <span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{b.farms} ฟาร์ม</span>
            <span className="mono" style={{ fontSize: 13 }}>{(b.plSold/1000000).toFixed(2)}M</span>
            <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: b.meanD30 < 75 ? 'var(--aw-bad)' : b.meanD30 >= 80 ? 'var(--aw-good)' : 'var(--aw-ink)' }}>
              {b.meanD30}%
            </span>
            <Bar values={b.dist} height={28} accent={b.pcr === 'flagged' ? 'var(--aw-bad)' : 'var(--aw-ink)'} highlight={b.dist.indexOf(Math.max(...b.dist))}/>
            <span style={{ textAlign: 'right', color: 'var(--aw-ink-4)' }}><Arrow/></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// === V2.1 Batch detail ===
function V2BatchDetail({ setPage, batchId }) {
  const D = window.AW_DATA;
  const b = D.BATCHES.find(x => x.id === batchId) || D.BATCHES[0];
  const farms = D.CUSTOMERS.slice(0, b.farms);

  return (
    <div style={{ padding: 24, maxWidth: 1440, margin: '0 auto' }}>
      <button onClick={() => setPage('batches')} className="label-mono"
        style={{ background: 'none', border: 0, padding: 0, marginBottom: 16, cursor: 'pointer', color: 'var(--aw-ink-3)' }}>
        <Arrow dir="left"/> กลับไปรายการล็อต
      </button>

      <Grid cols={12} gap={20} style={{ marginBottom: 20 }}>
        <Col span={9}>
          <div className="label-mono" style={{ marginBottom: 4 }}>{b.source} · ผลิต {b.date}</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>ล็อต {b.id}</h1>
          <div className="label" style={{ marginTop: 6 }}>
            ผลิต {(b.plProduced/1000000).toFixed(2)}M PL · ขายให้ {b.farms} ฟาร์ม · D30 เฉลี่ย {b.meanD30}%
          </div>
        </Col>
        <Col span={3} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button className="aw-btn aw-btn-blue" style={{ justifyContent: 'space-between' }}>ออกใบรับรอง <Arrow/></button>
          <button className="aw-btn aw-btn-ghost" style={{ justifyContent: 'space-between' }}>ส่งสรุปให้ทุกฟาร์ม</button>
        </Col>
      </Grid>

      <Grid cols={12} gap={1} style={{ background: 'var(--aw-line-2)', border: '1px solid var(--aw-line-2)', marginBottom: 24 }}>
        {[
          { label: 'ผลิตทั้งหมด', value: (b.plProduced/1000000).toFixed(1), unit: 'M PL' },
          { label: 'ขายแล้ว', value: (b.plSold/1000000).toFixed(2), unit: 'M PL' },
          { label: 'ฟาร์มที่รายงานแล้ว', value: b.farms, unit: 'ฟาร์ม' },
          { label: 'D30 เฉลี่ย', value: b.meanD30, unit: '%', accent: 'var(--aw-blue)' },
        ].map((s, i) => (
          <div key={i} style={{ gridColumn: 'span 3', background: 'var(--aw-card)', padding: 16 }}>
            <Stat {...s} big/>
          </div>
        ))}
      </Grid>

      <Grid cols={12} gap={20} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Section title="การกระจายอัตรารอด D30" meta="6 ฟาร์ม">
            <Card pad={20}>
              <Bar values={b.dist} labels={['50','55','60','65','70','75','80','85','90','95']}
                height={140} highlight={b.dist.indexOf(Math.max(...b.dist))}/>
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: 'var(--hairline-3)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <Stat label="ค่าเฉลี่ย" value={b.meanD30} unit="%"/>
                <Stat label="มัธยฐาน" value={b.meanD30 - 1} unit="%"/>
                <Stat label="ส่วนเบี่ยงเบน" value="±7.4"/>
                <Stat label="ช่วง" value="52–94" unit="%"/>
              </div>
            </Card>
          </Section>
        </Col>
        <Col span={4}>
          <Section title="ผลแล็บ PCR" meta="6 เชื้อ">
            <Card pad={0}>
              {[
                { name: 'WSSV', th: 'จุดขาว', result: 'neg' },
                { name: 'IHHNV', th: 'IHHNV', result: 'neg' },
                { name: 'EHP', th: 'แคระ EHP', result: 'neg' },
                { name: 'AHPND', th: 'EMS/AHPND', result: 'neg' },
                { name: 'YHV', th: 'หัวเหลือง', result: 'neg' },
                { name: 'TSV', th: 'TSV', result: b.pcr === 'flagged' ? 'pos' : 'neg' },
              ].map((p, i, arr) => (
                <div key={p.name} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: i < arr.length - 1 ? 'var(--hairline-3)' : 0,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{p.th}</div>
                    <div className="label-mono">{p.name}</div>
                  </div>
                  <Pill tone={p.result === 'neg' ? 'good' : 'bad'} size="xs">
                    {p.result === 'neg' ? '− ลบ' : '+ บวก'}
                  </Pill>
                </div>
              ))}
            </Card>
          </Section>
        </Col>
      </Grid>

      <Section title="ผลของแต่ละฟาร์ม" meta={`${b.farms} ฟาร์ม รายงานแล้ว`}>
        <div style={{ background: 'var(--aw-card)', border: '1px solid var(--aw-line-2)' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '60px 2fr 110px 80px 80px 1fr',
            padding: '10px 14px', borderBottom: 'var(--hairline-2)', background: 'var(--aw-bg-2)',
          }}>
            {['ID', 'ฟาร์ม', 'PL ที่ปล่อย', 'D30', 'D60', 'เทียบค่าเฉลี่ย'].map(h => <span key={h} className="label-mono">{h}</span>)}
          </div>
          {farms.map((f, i) => {
            const diff = (f.d30 ?? b.meanD30) - b.meanD30;
            return (
              <div key={f.id} className="aw-row" style={{
                display: 'grid', gridTemplateColumns: '60px 2fr 110px 80px 80px 1fr',
                padding: '14px', alignItems: 'center', gap: 8,
                borderBottom: i < farms.length - 1 ? 'var(--hairline-3)' : 0,
              }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--aw-ink-3)' }}>{f.id}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{f.farm}</div>
                  <div className="label">{f.zone}</div>
                </div>
                <span className="mono" style={{ fontSize: 13 }}>{((220+f.id.charCodeAt(2)*17%200)).toFixed(0)}k</span>
                <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: f.d30 == null ? 'var(--aw-ink-4)' : f.d30 < 60 ? 'var(--aw-bad)' : 'var(--aw-ink)' }}>{f.d30 ?? '—'}</span>
                <span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{f.d60 ?? '—'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 6, background: 'var(--aw-bg-2)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: 'var(--aw-ink-3)' }}/>
                    <div style={{
                      position: 'absolute', top: 0, bottom: 0,
                      [diff >= 0 ? 'left' : 'right']: '50%',
                      width: `${Math.min(50, Math.abs(diff) * 2)}%`,
                      background: diff >= 0 ? 'var(--aw-good)' : 'var(--aw-bad)',
                    }}/>
                  </div>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, width: 36, textAlign: 'right', color: diff >= 0 ? 'var(--aw-good)' : 'var(--aw-bad)' }}>
                    {diff >= 0 ? '+' : ''}{diff}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

// === V2.1 Batch register ===
function V2BatchRegister({ setPage }) {
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <button onClick={() => setPage('batches')} className="label-mono"
        style={{ background: 'none', border: 0, padding: 0, marginBottom: 16, cursor: 'pointer', color: 'var(--aw-ink-3)' }}>
        <Arrow dir="left"/> กลับ
      </button>

      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>ลงทะเบียนล็อตลูกกุ้งใหม่</h1>
      <div className="label" style={{ marginBottom: 24 }}>ขั้นตอนที่ 1 จาก 3 · ข้อมูลพื้นฐานและผล PCR</div>

      <Grid cols={12} gap={20}>
        <Col span={8}>
          <Section title="ข้อมูลล็อต" divider>
            <Card pad={20}>
              <Grid cols={12} gap={16}>
                <Col span={6}>
                  <div className="label" style={{ marginBottom: 6 }}>รหัสล็อต</div>
                  <input className="aw-input mono" defaultValue="B-2604-D"/>
                </Col>
                <Col span={6}>
                  <div className="label" style={{ marginBottom: 6 }}>วันที่ผลิต</div>
                  <input className="aw-input mono" defaultValue="2026-04-26"/>
                </Col>
                <Col span={6}>
                  <div className="label" style={{ marginBottom: 6 }}>สายพันธุ์ / แหล่งที่มา</div>
                  <input className="aw-input" defaultValue="CP-Genetics สาย A"/>
                </Col>
                <Col span={6}>
                  <div className="label" style={{ marginBottom: 6 }}>จำนวน PL ที่ผลิตได้</div>
                  <input className="aw-input mono" defaultValue="1,800,000"/>
                </Col>
              </Grid>
            </Card>
          </Section>

          <Section title="ผลตรวจ PCR" meta="6 เชื้อหลัก">
            <Card pad={0}>
              <Grid cols={12} gap={0}>
                {[
                  { name: 'WSSV', th: 'จุดขาว' },
                  { name: 'IHHNV', th: 'IHHNV' },
                  { name: 'EHP', th: 'แคระ EHP' },
                  { name: 'AHPND', th: 'EMS' },
                  { name: 'YHV', th: 'หัวเหลือง' },
                  { name: 'TSV', th: 'TSV' },
                ].map((p, i) => (
                  <Col key={p.name} span={6} style={{
                    padding: 14,
                    borderBottom: i < 4 ? 'var(--hairline-3)' : 0,
                    borderRight: i % 2 === 0 ? 'var(--hairline-3)' : 0,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{p.th}</div>
                      <div className="label-mono">{p.name}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ padding: '6px 10px', fontSize: 11, fontWeight: 600, background: 'var(--aw-good)', color: '#fff', border: 0, cursor: 'pointer' }}>− ลบ</button>
                      <button style={{ padding: '6px 10px', fontSize: 11, fontWeight: 600, background: 'transparent', color: 'var(--aw-ink-3)', border: '1px solid var(--aw-line-2)', cursor: 'pointer' }}>+ บวก</button>
                    </div>
                  </Col>
                ))}
              </Grid>
            </Card>
          </Section>

          <Section title="แนบใบรับรองและรูปภาพ">
            <div style={{ border: '2px dashed var(--aw-line-2)', padding: 36, textAlign: 'center', background: 'var(--aw-card)' }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>วางไฟล์ที่นี่ หรือกดเพื่อเลือก</div>
              <div className="label" style={{ marginTop: 6 }}>ใบ PCR (PDF) · รูปลูกกุ้ง · รูปบ่ออนุบาล</div>
              <div className="label-mono" style={{ marginTop: 12 }}>สูงสุด 20MB · PDF JPG PNG</div>
            </div>
          </Section>
        </Col>

        <Col span={4}>
          <div style={{ position: 'sticky', top: 80 }}>
            <Section title="ขั้นตอน" divider>
              <Card pad={0}>
                {[
                  { n: 1, label: 'ข้อมูลและ PCR', active: true },
                  { n: 2, label: 'ผลทดสอบความแข็งแรง', active: false },
                  { n: 3, label: 'จัดส่งให้ฟาร์ม', active: false },
                ].map((s, i, arr) => (
                  <div key={s.n} style={{
                    padding: 14,
                    borderBottom: i < arr.length - 1 ? 'var(--hairline-3)' : 0,
                    background: s.active ? 'var(--aw-ink)' : 'transparent',
                    color: s.active ? '#fff' : 'var(--aw-ink)',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span className="mono" style={{ fontSize: 11, opacity: 0.6 }}>{s.n}/3</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</span>
                  </div>
                ))}
              </Card>
            </Section>
            <button className="aw-btn aw-btn-blue" style={{ width: '100%', justifyContent: 'space-between' }}>ขั้นตอนต่อไป <Arrow/></button>
            <button className="aw-btn aw-btn-ghost" style={{ width: '100%', marginTop: 6, justifyContent: 'center' }}>บันทึกร่าง</button>
          </div>
        </Col>
      </Grid>
    </div>
  );
}

window.V2Batches = V2Batches;
window.V2BatchDetail = V2BatchDetail;
window.V2BatchRegister = V2BatchRegister;
