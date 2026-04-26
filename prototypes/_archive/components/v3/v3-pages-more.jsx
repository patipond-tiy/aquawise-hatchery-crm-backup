/* global React */
const { useState: _v3ms } = React;

// ============ RESTOCK ============
function V3Restock({ setPage, setCustomerId }) {
  const { customers, openModal, toast } = window.useV3();
  const due = customers.filter(c => c.restockIn != null).sort((a,b) => a.restockIn - b.restockIn);
  const groups = [
    { id: 'now', label: 'วันนี้', tone: 'bad', icon: '⚠', items: due.filter(c => c.restockIn <= 0) },
    { id: 'week', label: 'สัปดาห์นี้', tone: 'amber', icon: '◔', items: due.filter(c => c.restockIn > 0 && c.restockIn <= 14) },
    { id: 'month', label: 'เดือนนี้', tone: 'sky', icon: '◐', items: due.filter(c => c.restockIn > 14 && c.restockIn <= 45) },
    { id: 'later', label: 'หลังจากนั้น', tone: 'lav', icon: '◯', items: due.filter(c => c.restockIn > 45) },
  ];

  const totalPL = due.filter(c => c.restockIn <= 14).length * 120;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em' }}>ฟาร์มที่ใกล้ครบรอบ</h1>
          <div style={{ color: 'var(--aw3-ink-3)', fontSize: 15, marginTop: 4 }}>
            พยากรณ์จากวันลงลูกกุ้ง + ระยะเวลาเลี้ยงเฉลี่ย 110 วัน
          </div>
        </div>
        <button className="aw3-btn aw3-btn-hero" onClick={() => toast(`ส่งข้อความถึง ${due.filter(c => c.restockIn <= 14).length} ฟาร์มแล้ว`)}>
          ส่งข้อความหาทุกคน
          <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 8l5 5 7-10"/></svg>
        </button>
      </div>

      {/* Summary chips */}
      <V3Grid cols={4} gap={14} style={{ marginBottom: 28, marginTop: 22 }}>
        {[
          { label: 'ติดต่อด่วน', value: groups[0].items.length, tone: 'bad', sub: 'วันนี้ - พรุ่งนี้' },
          { label: 'รอบใหม่ใน 14 วัน', value: groups[1].items.length, tone: 'amber', sub: `~${totalPL}k PL` },
          { label: 'อีก 14-45 วัน', value: groups[2].items.length, tone: 'sky', sub: 'เริ่มเตรียมล็อต' },
          { label: 'หลังจากนั้น', value: groups[3].items.length, tone: 'lav', sub: 'ติดตามต่อ' },
        ].map((s, i) => (
          <V3Card key={i} pad={18} style={{ border: '1px solid var(--aw3-line)' }}>
            <V3Chip tone={s.tone} size="xs">{s.label}</V3Chip>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 12, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {s.value} <span style={{ fontSize: 14, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>ฟาร์ม</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--aw3-ink-4)', marginTop: 6 }}>{s.sub}</div>
          </V3Card>
        ))}
      </V3Grid>

      {/* Groups */}
      {groups.map(g => g.items.length > 0 && (
        <V3Section key={g.id} title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 24, height: 24, borderRadius: '50%',
              background: `var(--aw3-${g.tone === 'bad' ? 'bad-tint' : g.tone === 'amber' ? 'warn-tint' : g.tone})`,
              color: `var(--aw3-${g.tone === 'bad' ? 'bad' : g.tone === 'amber' ? 'warn' : g.tone+'-fg'})`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
            }}>{g.icon}</span>
            {g.label}
            <span style={{ color: 'var(--aw3-ink-4)', fontWeight: 500, fontSize: 14 }}>· {g.items.length}</span>
          </span>
        }>
          <V3Card pad={0} style={{ border: '1px solid var(--aw3-line)', overflow: 'hidden' }}>
            {g.items.map((c, i) => (
              <div key={c.id} className="aw3-row"
                onClick={() => { setCustomerId(c.id); setPage('customer'); }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1.6fr 1fr 1fr 1fr auto',
                  alignItems: 'center', gap: 14,
                  padding: '16px 20px',
                  borderBottom: i < g.items.length - 1 ? '1px solid var(--aw3-line)' : 0,
                }}>
                <V3Avatar name={c.farm} tone={['lav','peach','mint','sky','rose','amber'][i % 6]} size={42}/>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{c.farm}</div>
                  <div style={{ fontSize: 12, color: 'var(--aw3-ink-4)' }}>{c.name} · {c.zone}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>เก็บเกี่ยว</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {c.restockIn <= 0 ? 'แล้ว' : `อีก ${c.restockIn} วัน`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>รอบที่แล้ว</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{c.batches} ครั้ง</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>D30 รอบล่าสุด</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c.d30 >= 80 ? 'var(--aw3-good)' : c.d30 < 70 ? 'var(--aw3-bad)' : 'var(--aw3-ink)' }}>
                    {c.d30 ? `${c.d30}%` : '—'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                  <button className="aw3-btn aw3-btn-soft aw3-btn-sm" onClick={() => openModal('sendLine', { customer: c })}>
                    <svg width={12} height={12} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5l5-3 5 3M3 5v6l5 3 5-3V5"/></svg>
                    LINE
                  </button>
                  <button className="aw3-btn aw3-btn-hero aw3-btn-sm" onClick={() => openModal('quote', { customer: c })}>เสนอราคา</button>
                </div>
              </div>
            ))}
          </V3Card>
        </V3Section>
      ))}
    </div>
  );
}

// ============ DISEASE ALERTS ============
function V3Alerts({ setPage, setBatchId }) {
  const { alerts, openModal, toast } = window.useV3();
  const ALERTS = alerts.filter(a => !a.closed);

  const SEVS = {
    high: { bg: 'var(--aw3-bad-tint)', fg: 'var(--aw3-bad)', label: 'รุนแรง', icon: '⚠' },
    medium: { bg: 'var(--aw3-warn-tint)', fg: 'var(--aw3-warn)', label: 'ปานกลาง', icon: '◑' },
    low: { bg: 'var(--aw3-sky)', fg: 'var(--aw3-sky-fg)', label: 'เฝ้าระวัง', icon: 'i' },
  };

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em' }}>แจ้งเตือนโรค</h1>
      <div style={{ color: 'var(--aw3-ink-3)', fontSize: 15, marginBottom: 24, marginTop: 4 }}>
        ติดตามและตอบสนองต่อความผิดปกติย้อนกลับไปยังล็อตต้นทาง
      </div>

      <V3Grid cols={3} gap={14} style={{ marginBottom: 28 }}>
        {[
          { label: 'รุนแรง', value: 1, tone: 'bad' },
          { label: 'ปานกลาง', value: 1, tone: 'warn' },
          { label: 'เฝ้าระวัง', value: 1, tone: 'sky' },
        ].map((s, i) => (
          <V3Card key={i} pad={18} style={{ border: '1px solid var(--aw3-line)' }}>
            <V3Chip tone={s.tone === 'warn' ? 'amber' : s.tone} size="xs">{s.label}</V3Chip>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 12, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {s.value} <span style={{ fontSize: 14, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>เคส</span>
            </div>
          </V3Card>
        ))}
      </V3Grid>

      <V3Section title="แจ้งเตือนทั้งหมด" action={
        <select className="aw3-input" style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}>
          <option>ทุกระดับ</option><option>รุนแรงเท่านั้น</option><option>7 วันล่าสุด</option>
        </select>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ALERTS.map(a => {
            const sev = SEVS[a.sev];
            return (
              <V3Card key={a.id} pad={20} style={{
                border: '1px solid var(--aw3-line)',
                borderLeft: `4px solid ${sev.fg}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--r)',
                    background: sev.bg, color: sev.fg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 800, flexShrink: 0,
                  }}>{sev.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                      <V3Chip tone={a.sev === 'high' ? 'bad' : a.sev === 'medium' ? 'amber' : 'sky'} size="xs">{sev.label}</V3Chip>
                      <span style={{ fontSize: 11, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>{a.date}</span>
                      {a.batch && <span style={{ fontSize: 11, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>· ล็อต {a.batch}</span>}
                    </div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, lineHeight: 1.35 }}>{a.title}</h3>
                    <div style={{ fontSize: 13.5, color: 'var(--aw3-ink-3)', marginTop: 6, lineHeight: 1.55 }}>{a.desc}</div>

                    <div style={{
                      marginTop: 14, padding: '12px 14px',
                      background: 'var(--aw3-soft)', borderRadius: 'var(--r)',
                      fontSize: 13,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--aw3-ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                        ฟาร์มที่เกี่ยวข้อง
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {a.farms.map(f => (
                          <span key={f} style={{ padding: '4px 10px', background: '#fff', borderRadius: 'var(--r-pill)', fontSize: 12, fontWeight: 600 }}>{f}</span>
                        ))}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--aw3-ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 12, marginBottom: 4 }}>
                        แนะนำ
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{a.action}</div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      {a.batch && (
                        <button className="aw3-btn aw3-btn-soft aw3-btn-sm"
                          onClick={() => { setBatchId(a.batch); setPage('batch'); }}>
                          ดูล็อต {a.batch}
                        </button>
                      )}
                      <button className="aw3-btn aw3-btn-hero aw3-btn-sm"
                        onClick={() => a.farms.forEach(f => null) || toast(`ส่งข้อความถึง ${a.farms.length} ฟาร์มแล้ว`)}>
                        ส่งข้อความถึงฟาร์ม
                      </button>
                      <button className="aw3-btn aw3-btn-ghost aw3-btn-sm"
                        onClick={() => openModal('closeAlert', { alert: a })}>ปิดเคส</button>
                    </div>
                  </div>
                </div>
              </V3Card>
            );
          })}
        </div>
      </V3Section>
    </div>
  );
}

// ============ PUBLIC SCORECARD ============
function V3Scorecard() {
  const { scorecard, setScorecard, toast } = window.useV3();
  const pub = scorecard.public;
  const setPub = (v) => setScorecard(s => ({ ...s, public: v }));

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em' }}>คะแนนสาธารณะ</h1>
      <div style={{ color: 'var(--aw3-ink-3)', fontSize: 15, marginBottom: 24, marginTop: 4 }}>
        โปรไฟล์ที่ลูกค้ารายใหม่จะเห็นเมื่อสแกน QR หน้าตู้
      </div>

      <V3Grid cols={12} gap={20}>
        {/* Live preview */}
        <V3Col span={5}>
          <V3Card pad={0} style={{
            border: '1px solid var(--aw3-line)',
            background: 'linear-gradient(180deg, #F0F4FC 0%, #fff 30%)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '32px 28px 0', textAlign: 'center' }}>
              <V3Mark size={56}/>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--aw3-hero)', marginTop: 14, textTransform: 'uppercase' }}>
                AquaWise verified
              </div>
              <h2 style={{ margin: '14px 0 4px', fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em' }}>ฟ้าใส แฮทเชอรี่</h2>
              <div style={{ fontSize: 13, color: 'var(--aw3-ink-3)' }}>สมุทรสาคร · เปิดมาแล้ว 8 ปี</div>

              <div style={{
                margin: '24px auto 0', padding: '20px 22px',
                background: '#fff', borderRadius: 'var(--r-lg)',
                boxShadow: '0 4px 14px rgba(20,19,31,0.06)',
                textAlign: 'left',
              }}>
                <div className="eyebrow" style={{ marginBottom: 14 }}>ผลงาน 6 เดือนล่าสุด</div>
                {[
                  { label: 'อัตรารอด D30', val: 'สูงกว่ามัธยฐาน', accent: 'good' },
                  { label: 'ผ่าน PCR (4 โรค)', val: '100%', accent: 'good' },
                  { label: 'ฟาร์มที่กลับมาซื้อ', val: '78%', accent: 'good' },
                  { label: 'เฉลี่ย 12 ล็อต / 47 ฟาร์ม', val: '', accent: 'soft' },
                ].map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: i < 3 ? '1px solid var(--aw3-line)' : 0,
                  }}>
                    <span style={{ fontSize: 13, color: 'var(--aw3-ink-3)' }}>{r.label}</span>
                    {r.val && <span style={{ fontSize: 13, fontWeight: 700, color: r.accent === 'good' ? 'var(--aw3-good)' : 'var(--aw3-ink)' }}>{r.val}</span>}
                  </div>
                ))}
              </div>

              <div style={{
                margin: '20px 0 28px', padding: '12px 18px',
                background: 'var(--aw3-soft)', borderRadius: 'var(--r)',
                fontSize: 11.5, color: 'var(--aw3-ink-4)', lineHeight: 1.5, textAlign: 'left',
              }}>
                ข้อมูลจาก AquaWise — ไม่แสดงอันดับเทียบฟาร์มอื่น และไม่แสดงค่าที่ต่ำกว่ามัธยฐาน
              </div>
            </div>
          </V3Card>
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>
            ตัวอย่างที่ลูกค้าเห็นเมื่อสแกน
          </div>
        </V3Col>

        <V3Col span={7}>
          {/* Toggle */}
          <V3Card pad={20} style={{ border: '1px solid var(--aw3-line)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>เปิดให้สาธารณะดู</h3>
                <div style={{ fontSize: 13, color: 'var(--aw3-ink-3)', marginTop: 4 }}>
                  ลูกค้าที่สแกน QR จะเห็นข้อมูลด้านซ้าย
                </div>
              </div>
              <button onClick={() => setPub(!pub)} style={{
                width: 56, height: 32, borderRadius: 'var(--r-pill)',
                background: pub ? 'var(--aw3-hero)' : 'var(--aw3-line-2)',
                border: 0, cursor: 'pointer', position: 'relative',
                transition: 'all 0.15s',
              }}>
                <span style={{
                  position: 'absolute', top: 4, left: pub ? 28 : 4,
                  width: 24, height: 24, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.15s',
                }}/>
              </button>
            </div>
          </V3Card>

          {/* What's shown */}
          <V3Card pad={22} style={{ border: '1px solid var(--aw3-line)', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>สถิติที่แสดง</h3>
            <div style={{ fontSize: 12.5, color: 'var(--aw3-ink-3)', marginTop: 4, marginBottom: 14 }}>
              เปิด/ปิดได้ตามต้องการ — แต่เราจะไม่แสดงค่าต่ำกว่ามัธยฐานให้เห็นเลย
            </div>
            {[
              { label: 'อัตรารอด D30', desc: 'แสดงเป็นข้อความ "สูงกว่ามัธยฐาน" ไม่ใช่ตัวเลข', on: true },
              { label: 'ผลตรวจ PCR', desc: 'ผ่าน 4 โรค WSSV / EHP / IHHNV / TSV', on: true },
              { label: 'อัตราการกลับมาซื้อ', desc: 'ลูกค้าที่สั่งล็อตที่ 2 ภายใน 6 เดือน', on: true },
              { label: 'จำนวนฟาร์มและล็อต', desc: 'แสดงเฉพาะค่ารวม ไม่ระบุชื่อ', on: true },
              { label: 'รีวิวจากลูกค้า', desc: 'ยังไม่เปิด — รอเฟส 2', on: false },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 0',
                borderTop: i > 0 ? '1px solid var(--aw3-line)' : 0,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--aw3-ink-4)', marginTop: 2 }}>{r.desc}</div>
                </div>
                <div style={{
                  width: 44, height: 26, borderRadius: 'var(--r-pill)',
                  background: r.on ? 'var(--aw3-hero)' : 'var(--aw3-line-2)',
                  position: 'relative',
                }}>
                  <span style={{
                    position: 'absolute', top: 3, left: r.on ? 21 : 3,
                    width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  }}/>
                </div>
              </div>
            ))}
          </V3Card>

          {/* QR card */}
          <V3Card pad={22} style={{ border: '1px solid var(--aw3-line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{
                width: 96, height: 96, borderRadius: 'var(--r)',
                background: 'var(--aw3-soft)', padding: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg viewBox="0 0 80 80" width="100%" height="100%">
                  {Array.from({ length: 7 }).map((_, r) => Array.from({ length: 7 }).map((_, c) => {
                    const seed = (r * 7 + c * 3 + 11) % 5;
                    return seed > 1 && <rect key={`${r}-${c}`} x={r*10+5} y={c*10+5} width="9" height="9" fill="var(--aw3-ink)"/>;
                  }))}
                  <rect x="0" y="0" width="22" height="22" fill="none" stroke="var(--aw3-ink)" strokeWidth="3"/>
                  <rect x="58" y="0" width="22" height="22" fill="none" stroke="var(--aw3-ink)" strokeWidth="3"/>
                  <rect x="0" y="58" width="22" height="22" fill="none" stroke="var(--aw3-ink)" strokeWidth="3"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>QR หน้าตู้</h3>
                <div style={{ fontSize: 13, color: 'var(--aw3-ink-3)', marginTop: 4 }}>
                  ลูกค้าใหม่สแกนเพื่อดูโปรไฟล์ + เพิ่มเป็นเพื่อน LINE
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="aw3-btn aw3-btn-soft aw3-btn-sm" onClick={() => toast('ดาวน์โหลด PDF แล้ว')}>ดาวน์โหลด PDF</button>
                  <button className="aw3-btn aw3-btn-ghost aw3-btn-sm" onClick={() => toast('ส่งทาง LINE แล้ว')}>ส่ง LINE</button>
                </div>
              </div>
            </div>
          </V3Card>
        </V3Col>
      </V3Grid>
    </div>
  );
}

// ============ SETTINGS ============
function V3Settings() {
  const [tab, setTab] = _v3ms('profile');
  const TABS = [
    { id: 'profile', label: 'โปรไฟล์ฟาร์ม' },
    { id: 'notifications', label: 'การแจ้งเตือน' },
    { id: 'team', label: 'ทีมงาน' },
    { id: 'data', label: 'ข้อมูลและส่งออก' },
    { id: 'billing', label: 'แพ็กเกจ' },
  ];

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em' }}>ตั้งค่า</h1>
      <div style={{ color: 'var(--aw3-ink-3)', fontSize: 15, marginBottom: 24, marginTop: 4 }}>
        จัดการโปรไฟล์ การแจ้งเตือน และข้อมูลส่งออก
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 22, padding: 4, background: 'var(--aw3-soft)', borderRadius: 'var(--r)', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '10px 18px', border: 0, borderRadius: 'var(--r-sm)',
              background: tab === t.id ? '#fff' : 'transparent',
              color: tab === t.id ? 'var(--aw3-ink)' : 'var(--aw3-ink-3)',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
            }}>{t.label}</button>
        ))}
      </div>

      {tab === 'profile' && <V3SettingsProfile/>}
      {tab === 'notifications' && <V3SettingsNotif/>}
      {tab === 'team' && <V3SettingsTeam/>}
      {tab === 'data' && <V3SettingsData/>}
      {tab === 'billing' && <V3SettingsBilling/>}
    </div>
  );
}

function V3SettingsProfile() {
  return (
    <V3Grid cols={12} gap={16}>
      <V3Col span={8}>
        <V3Card pad={26} style={{ border: '1px solid var(--aw3-line)' }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>ข้อมูลฟาร์ม</h3>
          <div style={{ fontSize: 13, color: 'var(--aw3-ink-3)', marginTop: 4, marginBottom: 22 }}>
            ข้อมูลนี้จะแสดงในใบรับรองและในโปรไฟล์สาธารณะ
          </div>
          {[
            { label: 'ชื่อโรงเพาะ', value: 'ฟ้าใส แฮทเชอรี่' },
            { label: 'ชื่อภาษาอังกฤษ', value: 'Fasai Hatchery' },
            { label: 'เลขทะเบียน', value: 'TH-HATCH-23489' },
            { label: 'ที่อยู่', value: '78/12 ม.4 ต.บ้านบ่อ อ.เมือง สมุทรสาคร 74000' },
            { label: 'เบอร์ติดต่อ', value: '081-234-5678' },
            { label: 'LINE OA', value: '@fasaihatchery' },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--aw3-ink-3)', marginBottom: 6 }}>{f.label}</label>
              <input className="aw3-input" defaultValue={f.value} style={{ fontSize: 14 }}/>
            </div>
          ))}
          <button className="aw3-btn aw3-btn-hero" style={{ marginTop: 8 }}>บันทึก</button>
        </V3Card>
      </V3Col>
      <V3Col span={4}>
        <V3Card pad={22} style={{ border: '1px solid var(--aw3-line)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>โลโก้</h3>
          <div style={{
            marginTop: 14, height: 160, borderRadius: 'var(--r)',
            background: 'var(--aw3-soft)', border: '2px dashed var(--aw3-line-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 8, color: 'var(--aw3-ink-4)',
          }}>
            <V3Mark size={48}/>
            <div style={{ fontSize: 12, fontWeight: 600 }}>ลากไฟล์มาวางหรือคลิก</div>
          </div>
          <button className="aw3-btn aw3-btn-soft" style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}>อัปโหลด</button>
        </V3Card>
        <V3Card pad={22} style={{ border: '1px solid var(--aw3-line)', marginTop: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>เปิดมาแล้ว</h3>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8, letterSpacing: '-0.02em' }}>
            8 <span style={{ fontSize: 14, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>ปี</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--aw3-ink-3)', marginTop: 4 }}>เริ่มกิจการ มี.ค. 2018</div>
        </V3Card>
      </V3Col>
    </V3Grid>
  );
}

function V3SettingsNotif() {
  const ROWS = [
    { label: 'มีฟาร์มที่ใกล้ครบรอบ (≤14 วัน)', desc: 'ดู สรุปทุกเช้า 7:00 น.', on: true },
    { label: 'D30 ของล็อตต่ำกว่าเป้า', desc: 'ส่งเมื่อมีฟาร์ม ≥2 ที่รายงานต่ำ', on: true },
    { label: 'พบเชื้อในล็อตที่ส่งไปแล้ว', desc: 'ส่งทันที + เสนอให้ส่งข้อความถึงทุกฟาร์ม', on: true },
    { label: 'ลูกค้าตอบรับใน LINE', desc: 'ทุกข้อความที่ส่งมา', on: false },
    { label: 'สรุปรายสัปดาห์', desc: 'ทุกวันจันทร์เช้า', on: true },
    { label: 'ราคาตลาดเปลี่ยน > 5%', desc: 'จากตลาดทะเลไทย สมุทรสาคร', on: true },
  ];
  return (
    <V3Card pad={26} style={{ border: '1px solid var(--aw3-line)', maxWidth: 720 }}>
      {ROWS.map((r, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '16px 0',
          borderTop: i > 0 ? '1px solid var(--aw3-line)' : 0,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{r.label}</div>
            <div style={{ fontSize: 12.5, color: 'var(--aw3-ink-4)', marginTop: 2 }}>{r.desc}</div>
          </div>
          <div style={{
            width: 48, height: 28, borderRadius: 'var(--r-pill)',
            background: r.on ? 'var(--aw3-hero)' : 'var(--aw3-line-2)',
            position: 'relative', cursor: 'pointer',
          }}>
            <span style={{
              position: 'absolute', top: 3, left: r.on ? 23 : 3,
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
            }}/>
          </div>
        </div>
      ))}
    </V3Card>
  );
}

function V3SettingsTeam() {
  const { openModal } = window.useV3();
  const TEAM = [
    { name: 'สุเทพ ใจดี', role: 'เจ้าของฟาร์ม', perm: 'admin', tone: 'lav' },
    { name: 'นิภา ใจดี', role: 'หัวหน้าโรงเพาะ', perm: 'admin', tone: 'mint' },
    { name: 'พรชัย ตั้งใจ', role: 'เจ้าหน้าที่ PCR', perm: 'editor', tone: 'sky' },
    { name: 'รัตนา สุขสวัสดิ์', role: 'ดูแลลูกค้า', perm: 'editor', tone: 'rose' },
    { name: 'มานพ จงดี', role: 'ดูข้อมูลอย่างเดียว', perm: 'viewer', tone: 'amber' },
  ];
  const PERMS = { admin: { label: 'แอดมิน', tone: 'solid' }, editor: { label: 'แก้ไขได้', tone: 'sky' }, viewer: { label: 'ดูเท่านั้น', tone: 'soft' } };
  return (
    <div>
      <V3Card pad={0} style={{ border: '1px solid var(--aw3-line)', overflow: 'hidden', maxWidth: 820 }}>
        {TEAM.map((t, i) => (
          <div key={t.name} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 22px',
            borderTop: i > 0 ? '1px solid var(--aw3-line)' : 0,
          }}>
            <V3Avatar name={t.name} tone={t.tone} size={42}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: 'var(--aw3-ink-4)' }}>{t.role}</div>
            </div>
            <V3Chip tone={PERMS[t.perm].tone} size="xs">{PERMS[t.perm].label}</V3Chip>
            <button className="aw3-btn aw3-btn-ghost aw3-btn-sm">แก้ไข</button>
          </div>
        ))}
      </V3Card>
      <button className="aw3-btn aw3-btn-hero" style={{ marginTop: 16 }} onClick={() => openModal('invite')}>+ เชิญสมาชิก</button>
    </div>
  );
}

function V3SettingsData() {
  return (
    <V3Grid cols={2} gap={16} style={{ maxWidth: 920 }}>
      {[
        { title: 'ส่งออกข้อมูลลูกค้า', desc: 'CSV รายชื่อฟาร์ม ประวัติการสั่ง และผลลัพธ์', cta: 'ดาวน์โหลด CSV' },
        { title: 'ส่งออกประวัติ PCR', desc: 'PDF + ภาพถ่ายของทุกล็อตในช่วงที่เลือก', cta: 'ดาวน์โหลด ZIP' },
        { title: 'สำรองข้อมูลทั้งหมด', desc: 'JSON สำรองไว้ — ใช้เมื่อย้ายระบบ', cta: 'ดาวน์โหลด' },
        { title: 'ลบข้อมูลทั้งหมด', desc: 'ทำไม่ได้กลับ — ติดต่อทีมงานก่อน', cta: 'ติดต่อทีม', danger: true },
      ].map((r, i) => (
        <V3Card key={i} pad={22} style={{ border: '1px solid var(--aw3-line)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{r.title}</h3>
          <div style={{ fontSize: 13, color: 'var(--aw3-ink-3)', marginTop: 6, lineHeight: 1.6, marginBottom: 16 }}>{r.desc}</div>
          <button className={r.danger ? 'aw3-btn aw3-btn-ghost' : 'aw3-btn aw3-btn-soft'}
            style={{ color: r.danger ? 'var(--aw3-bad)' : undefined }}>
            {r.cta}
          </button>
        </V3Card>
      ))}
    </V3Grid>
  );
}

function V3SettingsBilling() {
  return (
    <V3Grid cols={12} gap={16}>
      <V3Col span={7}>
        <V3Card pad={28} style={{
          border: '1px solid var(--aw3-line)',
          background: 'linear-gradient(135deg, #004AAD 0%, #1A66C7 100%)',
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', opacity: 0.85 }}>
            แพ็กเกจปัจจุบัน
          </div>
          <h2 style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 800, letterSpacing: '-0.01em' }}>Pro</h2>
          <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>2,490 บาท / เดือน · ต่ออายุ 12 พ.ค. 2026</div>
          <div style={{ marginTop: 22, display: 'flex', gap: 14, fontSize: 13 }}>
            <div><b>50</b> ฟาร์ม</div>
            <div><b>ไม่จำกัด</b> ล็อต</div>
            <div><b>5</b> ทีมงาน</div>
            <div>LIFF + LINE OA</div>
          </div>
          <button className="aw3-btn" style={{ background: '#fff', color: 'var(--aw3-hero)', marginTop: 24 }}>เปลี่ยนแพ็กเกจ</button>
        </V3Card>
      </V3Col>
      <V3Col span={5}>
        <V3Card pad={22} style={{ border: '1px solid var(--aw3-line)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>การชำระล่าสุด</h3>
          {[
            { date: '12 เม.ย. 2026', amt: 2490 },
            { date: '12 มี.ค. 2026', amt: 2490 },
            { date: '12 ก.พ. 2026', amt: 2490 },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '12px 0',
              borderTop: i === 0 ? '1px solid var(--aw3-line)' : '1px solid var(--aw3-line)',
              marginTop: i === 0 ? 14 : 0,
              fontSize: 13,
            }}>
              <span style={{ color: 'var(--aw3-ink-3)' }}>{r.date}</span>
              <span style={{ fontWeight: 700 }}>฿{r.amt.toLocaleString()}</span>
            </div>
          ))}
        </V3Card>
      </V3Col>
    </V3Grid>
  );
}

// ============ BATCH DETAIL ============
function V3BatchDetail({ setPage, batchId }) {
  const { batches, openModal, toast } = window.useV3();
  const D = window.AW_DATA;
  const b = batches.find(x => x.id === batchId) || batches[0];
  const buyers = D.CUSTOMERS.slice(0, b.farms);
  const dist = b.dist;
  const distMax = Math.max(...dist);
  const distLabels = ['<50','50-55','55-60','60-65','65-70','70-75','75-80','80-85','85-90','>90'];

  return (
    <div>
      <button onClick={() => setPage('batches')} style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer', color: 'var(--aw3-ink-3)', marginBottom: 14, fontSize: 13 }}>← ล็อตทั้งหมด</button>

      <V3Card pad={28} style={{ border: '1px solid var(--aw3-line)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <V3Avatar name={b.id} size={68} tone={b.pcr === 'clean' ? 'mint' : 'rose'}/>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em' }}>ล็อต {b.id}</h1>
              <V3Chip tone={b.pcr === 'clean' ? 'good' : 'bad'} size="xs">PCR {b.pcr === 'clean' ? '✓ สะอาด' : '⚠ พบเชื้อ'}</V3Chip>
            </div>
            <div style={{ fontSize: 14, color: 'var(--aw3-ink-3)', marginTop: 4 }}>
              ลงวันที่ {b.date} · {b.source}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="aw3-btn aw3-btn-soft" onClick={() => toast(`พิมพ์ใบรับรอง ${b.id} แล้ว`)}>พิมพ์ใบรับรอง</button>
            <button className="aw3-btn aw3-btn-hero" onClick={() => openModal('cert', { batch: b })}>ส่งใบรับรอง LINE</button>
          </div>
        </div>
      </V3Card>

      <V3Grid cols={4} gap={14} style={{ marginBottom: 20 }}>
        {[
          { label: 'ผลิต', value: `${(b.plProduced/1000000).toFixed(1)}M`, sub: 'PL ทั้งหมด', tone: 'lav' },
          { label: 'ขายแล้ว', value: `${(b.plSold/1000000).toFixed(1)}M`, sub: `${Math.round(b.plSold/b.plProduced*100)}% ของล็อต`, tone: 'sky' },
          { label: 'ฟาร์มที่ซื้อ', value: b.farms, sub: 'ตามสายไปได้', tone: 'mint' },
          { label: 'D30 เฉลี่ย', value: `${b.meanD30}%`, sub: b.meanD30 >= 80 ? 'เกินเป้า' : 'ต่ำกว่าเป้า', tone: b.meanD30 >= 80 ? 'good' : 'amber' },
        ].map((s, i) => (
          <V3Card key={i} pad={18} style={{ border: '1px solid var(--aw3-line)' }}>
            <V3Chip tone={s.tone} size="xs">{s.label}</V3Chip>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 12, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--aw3-ink-4)', marginTop: 6 }}>{s.sub}</div>
          </V3Card>
        ))}
      </V3Grid>

      <V3Grid cols={12} gap={20}>
        <V3Col span={7}>
          <V3Card pad={24} style={{ border: '1px solid var(--aw3-line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>การกระจายของอัตรารอด D30</h3>
              <V3Chip tone="soft" size="xs">{b.farms} ฟาร์ม</V3Chip>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--aw3-ink-3)', marginBottom: 18 }}>
              แต่ละแท่งคือจำนวนฟาร์มในช่วงอัตรารอดนั้น
            </div>
            <window.V3DistChart values={dist} labels={distLabels} height={170}/>
          </V3Card>
        </V3Col>
        <V3Col span={5}>
          <V3Card pad={22} style={{ border: '1px solid var(--aw3-line)', height: '100%' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>ผลตรวจ PCR</h3>
            <div style={{ fontSize: 12, color: 'var(--aw3-ink-3)', marginTop: 4, marginBottom: 18 }}>ตรวจวันที่ {b.date} · ห้องปฏิบัติการ DOFR</div>
            {['WSSV', 'EHP', 'IHHNV', 'TSV'].map((d, i) => {
              const flagged = b.pcr !== 'clean' && d === 'EHP';
              return (
                <div key={d} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0',
                  borderTop: i > 0 ? '1px solid var(--aw3-line)' : 0,
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: flagged ? 'var(--aw3-bad-tint)' : 'var(--aw3-good-tint)',
                    color: flagged ? 'var(--aw3-bad)' : 'var(--aw3-good)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800,
                  }}>{flagged ? '⚠' : '✓'}</div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{d}</div>
                  <V3Chip tone={flagged ? 'bad' : 'good'} size="xs">{flagged ? 'พบเชื้อ' : 'ไม่พบเชื้อ'}</V3Chip>
                </div>
              );
            })}
          </V3Card>
        </V3Col>
      </V3Grid>

      <V3Section title="ฟาร์มที่ซื้อล็อตนี้" style={{ marginTop: 28 }}>
        <V3Card pad={0} style={{ border: '1px solid var(--aw3-line)', overflow: 'hidden' }}>
          {buyers.map((c, i) => (
            <div key={c.id} style={{
              display: 'grid', gridTemplateColumns: '50px 1.5fr 1fr 1fr 1fr 80px',
              alignItems: 'center', gap: 14,
              padding: '14px 20px',
              borderBottom: i < buyers.length - 1 ? '1px solid var(--aw3-line)' : 0,
            }}>
              <V3Avatar name={c.farm} tone={['lav','peach','mint','sky','rose','amber'][i % 6]} size={36}/>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{c.farm}</div>
                <div style={{ fontSize: 11, color: 'var(--aw3-ink-4)' }}>{c.zone}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>ซื้อ</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{(180 + i * 30)}k PL</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>D30</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.d30 >= 80 ? 'var(--aw3-good)' : c.d30 < 70 ? 'var(--aw3-bad)' : 'var(--aw3-ink)' }}>
                  {c.d30 ? `${c.d30}%` : 'รอ'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>สถานะ</div>
                <V3Chip tone={c.cycleDay ? 'sky' : 'soft'} size="xs">{c.cycleDay ? `วันที่ ${c.cycleDay}` : 'จบรอบ'}</V3Chip>
              </div>
              <V3RoundBtn dir="right" size={30} tone="soft"/>
            </div>
          ))}
        </V3Card>
      </V3Section>
    </div>
  );
}

window.V3Restock = V3Restock;
window.V3Alerts = V3Alerts;
window.V3Scorecard = V3Scorecard;
window.V3Settings = V3Settings;
window.V3BatchDetail = V3BatchDetail;
