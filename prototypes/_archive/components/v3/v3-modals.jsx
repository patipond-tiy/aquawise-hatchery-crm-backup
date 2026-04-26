/* global React */
const { useState: _v3ms2 } = React;

// =============================================================
// All modal bodies — keyed by `kind` in openModal('kind', props)
// =============================================================

// ---- Add Customer ----
function V3M_AddCustomer({ close }) {
  const { addCustomer } = window.useV3();
  const [f, setF] = _v3ms2({ farm: '', name: '', phone: '', zone: 'สมุทรสาคร', plan: '300k' });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const submit = () => {
    if (!f.farm || !f.name) return;
    addCustomer(f);
    close();
  };
  return (
    <window.V3ModalShell title="เพิ่มลูกค้าใหม่" subtitle="ข้อมูลฟาร์มที่จะใช้ในใบรับรองและ LINE OA" close={close} footer={
      <>
        <button className="aw3-btn aw3-btn-ghost" onClick={close}>ยกเลิก</button>
        <button className="aw3-btn aw3-btn-hero" onClick={submit}>เพิ่มลูกค้า</button>
      </>
    }>
      <window.V3Field label="ชื่อฟาร์ม">
        <input className="aw3-input" placeholder="เช่น ฟาร์มกุ้งบ้านสวน" value={f.farm} onChange={e => set('farm', e.target.value)}/>
      </window.V3Field>
      <window.V3Field label="ชื่อเจ้าของ">
        <input className="aw3-input" placeholder="ชื่อ-นามสกุล" value={f.name} onChange={e => set('name', e.target.value)}/>
      </window.V3Field>
      <window.V3Field label="เบอร์โทรศัพท์">
        <input className="aw3-input" placeholder="081-234-5678" value={f.phone} onChange={e => set('phone', e.target.value)}/>
      </window.V3Field>
      <window.V3Field label="เขต/จังหวัด">
        <select className="aw3-input" value={f.zone} onChange={e => set('zone', e.target.value)}>
          <option>สมุทรสาคร</option><option>ฉะเชิงเทรา</option><option>สมุทรสงคราม</option><option>เพชรบุรี</option><option>ตราด</option>
        </select>
      </window.V3Field>
      <window.V3Field label="แพ็กเกจที่สนใจ" hint="ปรับเปลี่ยนได้ตอนเสนอราคา">
        <div style={{ display: 'flex', gap: 8 }}>
          {['200k', '300k', '500k', '1M'].map(p => (
            <button key={p} onClick={() => set('plan', p)} style={{
              flex: 1, padding: '10px 0', border: 0, borderRadius: 'var(--r)',
              background: f.plan === p ? 'var(--aw3-hero)' : 'var(--aw3-soft)',
              color: f.plan === p ? '#fff' : 'var(--aw3-ink-2)',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>{p} PL</button>
          ))}
        </div>
      </window.V3Field>
    </window.V3ModalShell>
  );
}

// ---- Add Batch ----
function V3M_AddBatch({ close }) {
  const { addBatch } = window.useV3();
  const [step, setStep] = _v3ms2(1);
  const [f, setF] = _v3ms2({ source: 'CP-Genetics Line A', plProduced: 2000000, date: '2026-04-26', pcr: 'pending' });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const next = () => step < 3 ? setStep(step + 1) : (() => { addBatch({ ...f, meanD30: 0, dist: [0,0,0,0,0,0,0,0,0,0] }); close(); })();

  const STEPS = ['ข้อมูลล็อต', 'ผลตรวจ PCR', 'ยืนยัน'];

  return (
    <window.V3ModalShell title="ลงทะเบียนล็อตใหม่" subtitle={`ขั้นที่ ${step} จาก 3 — ${STEPS[step-1]}`} close={close} footer={
      <>
        {step > 1 && <button className="aw3-btn aw3-btn-ghost" onClick={() => setStep(step-1)}>ย้อนกลับ</button>}
        <button className="aw3-btn aw3-btn-hero" onClick={next}>{step === 3 ? 'ลงทะเบียน' : 'ถัดไป →'}</button>
      </>
    }>
      {/* Stepper */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 'var(--r-pill)',
            background: i + 1 <= step ? 'var(--aw3-hero)' : 'var(--aw3-line-2)',
          }}/>
        ))}
      </div>

      {step === 1 && (
        <>
          <window.V3Field label="สายพันธุ์">
            <select className="aw3-input" value={f.source} onChange={e => set('source', e.target.value)}>
              <option>CP-Genetics Line A</option><option>CP-Genetics Line B</option><option>SyAqua Line 7</option><option>Shrimp Improvement Sys.</option>
            </select>
          </window.V3Field>
          <window.V3Field label="วันที่ลงไข่">
            <input className="aw3-input" type="date" value={f.date} onChange={e => set('date', e.target.value)}/>
          </window.V3Field>
          <window.V3Field label="จำนวน PL ที่ผลิต" hint="หน่วยล้านตัว">
            <input className="aw3-input" type="number" step="0.1" value={f.plProduced/1000000} onChange={e => set('plProduced', parseFloat(e.target.value)*1000000)}/>
          </window.V3Field>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ fontSize: 13, color: 'var(--aw3-ink-3)', marginBottom: 14 }}>เลือกอัปโหลดไฟล์ PCR หรือกรอกผลด้วยตัวเอง</div>
          <div style={{
            padding: 24, borderRadius: 'var(--r)',
            background: 'var(--aw3-soft)', border: '2px dashed var(--aw3-line-2)',
            textAlign: 'center', marginBottom: 18, cursor: 'pointer',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>อัปโหลดไฟล์ PCR</div>
            <div style={{ fontSize: 12, color: 'var(--aw3-ink-4)', marginTop: 4 }}>PDF, JPG หรือ PNG</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['WSSV','EHP','IHHNV','TSV'].map(d => (
              <div key={d} style={{ flex: 1, padding: 12, background: 'var(--aw3-good-tint)', borderRadius: 'var(--r-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--aw3-good)', fontWeight: 700 }}>{d}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--aw3-good)', marginTop: 2 }}>✓ ผ่าน</div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <div>
          <div style={{ padding: 18, borderRadius: 'var(--r)', background: 'var(--aw3-soft)', marginBottom: 14 }}>
            {[
              ['สายพันธุ์', f.source],
              ['วันที่ลงไข่', f.date],
              ['ปริมาณ', `${(f.plProduced/1000000).toFixed(1)}M PL`],
              ['PCR', '✓ ผ่านทุกชนิด'],
            ].map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? '1px solid var(--aw3-line)' : 0 }}>
                <span style={{ color: 'var(--aw3-ink-3)', fontSize: 13 }}>{k}</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--aw3-ink-4)' }}>กดลงทะเบียนเพื่อสร้างใบรับรองและเปิดให้ขายในระบบ</div>
        </div>
      )}
    </window.V3ModalShell>
  );
}

// ---- Send LINE message ----
function V3M_SendLine({ close, customer }) {
  const { toast } = window.useV3();
  const [msg, setMsg] = _v3ms2('สวัสดีครับ คุณ' + (customer?.name?.split(' ')[0] || '') + ' รอบนี้ใกล้ครบแล้ว ทางเรามีล็อตใหม่ B-2604-A พร้อมส่ง 320k PL ครับ');
  const send = () => { toast(`ส่งข้อความถึง ${customer?.farm || 'ลูกค้า'} แล้ว`); close(); };
  return (
    <window.V3ModalShell title="ส่งข้อความผ่าน LINE" subtitle={customer?.farm} close={close} footer={
      <>
        <button className="aw3-btn aw3-btn-ghost" onClick={close}>ยกเลิก</button>
        <button className="aw3-btn aw3-btn-hero" onClick={send}>
          ส่งข้อความ
          <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 8h12M9 4l5 4-5 4"/></svg>
        </button>
      </>
    }>
      <window.V3Field label="แม่แบบ">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['ใกล้ครบรอบ', 'มีล็อตใหม่', 'ส่งใบรับรอง', 'ขอราคาเก็บเกี่ยว'].map(t => (
            <button key={t} onClick={() => setMsg(`[แม่แบบ "${t}"] สวัสดีครับ ...`)} style={{
              padding: '7px 12px', borderRadius: 'var(--r-pill)',
              background: 'var(--aw3-soft)', border: 0,
              fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            }}>{t}</button>
          ))}
        </div>
      </window.V3Field>
      <window.V3Field label="ข้อความ" hint={`${msg.length} / 1000 อักษร`}>
        <textarea className="aw3-input" rows={5} value={msg} onChange={e => setMsg(e.target.value)} style={{ fontSize: 14, lineHeight: 1.6, resize: 'vertical' }}/>
      </window.V3Field>
      <div style={{ padding: 14, borderRadius: 'var(--r)', background: 'var(--aw3-mint)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 18 }}>💬</span>
        <div style={{ fontSize: 12.5, color: 'var(--aw3-mint-fg)', fontWeight: 600 }}>
          จะส่งผ่าน LINE Official Account @fasaihatchery
        </div>
      </div>
    </window.V3ModalShell>
  );
}

// ---- Send Quote ----
function V3M_Quote({ close, customer }) {
  const { toast } = window.useV3();
  const [size, setSize] = _v3ms2('300k');
  const [batch, setBatch] = _v3ms2('B-2604-A');
  const [discount, setDiscount] = _v3ms2(5);
  const sizes = { '200k': 200, '300k': 300, '500k': 500, '1M': 1000 };
  const unitPrice = 0.18;
  const subtotal = sizes[size] * 1000 * unitPrice;
  const total = subtotal * (1 - discount / 100);

  const send = () => { toast(`ส่งใบเสนอราคาให้ ${customer?.farm || 'ลูกค้า'} แล้ว`); close(); };

  return (
    <window.V3ModalShell title="เสนอราคาล็อตใหม่" subtitle={customer?.farm} close={close} footer={
      <>
        <button className="aw3-btn aw3-btn-ghost" onClick={close}>ยกเลิก</button>
        <button className="aw3-btn aw3-btn-hero" onClick={send}>ส่งใบเสนอราคา LINE</button>
      </>
    }>
      <window.V3Field label="เลือกล็อต">
        <select className="aw3-input" value={batch} onChange={e => setBatch(e.target.value)}>
          {window.AW_DATA.BATCHES.filter(b => b.pcr === 'clean').map(b => (
            <option key={b.id}>{b.id} — {b.source} ({(b.plProduced/1000000).toFixed(1)}M)</option>
          ))}
        </select>
      </window.V3Field>
      <window.V3Field label="ปริมาณ">
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.keys(sizes).map(s => (
            <button key={s} onClick={() => setSize(s)} style={{
              flex: 1, padding: '12px 0', border: 0, borderRadius: 'var(--r)',
              background: size === s ? 'var(--aw3-hero)' : 'var(--aw3-soft)',
              color: size === s ? '#fff' : 'var(--aw3-ink-2)',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>{s} PL</button>
          ))}
        </div>
      </window.V3Field>
      <window.V3Field label={`ส่วนลดลูกค้าเก่า: ${discount}%`}>
        <input type="range" min="0" max="15" value={discount} onChange={e => setDiscount(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--aw3-hero)' }}/>
      </window.V3Field>
      <div style={{ padding: 18, borderRadius: 'var(--r)', background: 'var(--aw3-soft)', marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
          <span style={{ color: 'var(--aw3-ink-3)' }}>ราคา {sizes[size]}k × ฿{unitPrice}/PL</span>
          <span>฿{subtotal.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
          <span style={{ color: 'var(--aw3-ink-3)' }}>ส่วนลด {discount}%</span>
          <span style={{ color: 'var(--aw3-bad)' }}>−฿{(subtotal-total).toLocaleString()}</span>
        </div>
        <div style={{ borderTop: '1px solid var(--aw3-line)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 700 }}>รวม</span>
          <span style={{ fontSize: 22, fontWeight: 800 }}>฿{total.toLocaleString()}</span>
        </div>
      </div>
    </window.V3ModalShell>
  );
}

// ---- Send Certificate ----
function V3M_Cert({ close, batch }) {
  const { toast } = window.useV3();
  const [recipients, setRecipients] = _v3ms2(window.AW_DATA.CUSTOMERS.slice(0,4).map(c => c.id));
  const toggle = (id) => setRecipients(r => r.includes(id) ? r.filter(x => x !== id) : [...r, id]);
  const send = () => { toast(`ส่งใบรับรอง ${batch?.id || ''} ให้ ${recipients.length} ฟาร์มแล้ว`); close(); };
  return (
    <window.V3ModalShell title="ส่งใบรับรอง" subtitle={`ล็อต ${batch?.id || 'B-2604-A'}`} close={close} footer={
      <>
        <button className="aw3-btn aw3-btn-ghost" onClick={close}>ยกเลิก</button>
        <button className="aw3-btn aw3-btn-hero" onClick={send} disabled={recipients.length === 0}>
          ส่งให้ {recipients.length} ฟาร์ม
        </button>
      </>
    }>
      <window.V3Field label="วิธีการส่ง">
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="aw3-btn aw3-btn-hero aw3-btn-sm" style={{ flex: 1, justifyContent: 'center' }}>LINE Flex</button>
          <button className="aw3-btn aw3-btn-soft aw3-btn-sm" style={{ flex: 1, justifyContent: 'center' }}>PDF แนบ</button>
          <button className="aw3-btn aw3-btn-soft aw3-btn-sm" style={{ flex: 1, justifyContent: 'center' }}>SMS ลิงก์</button>
        </div>
      </window.V3Field>
      <window.V3Field label="ส่งให้ฟาร์ม">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflow: 'auto', padding: 4, margin: -4 }}>
          {window.AW_DATA.CUSTOMERS.slice(0, 8).map(c => {
            const on = recipients.includes(c.id);
            return (
              <div key={c.id} onClick={() => toggle(c.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 10,
                borderRadius: 'var(--r)', cursor: 'pointer',
                background: on ? 'var(--aw3-hero-soft)' : 'var(--aw3-soft)',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 'var(--r-sm)',
                  background: on ? 'var(--aw3-hero)' : '#fff',
                  border: on ? 0 : '1.5px solid var(--aw3-line-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                }}>{on ? '✓' : ''}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.farm}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--aw3-ink-4)' }}>{c.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </window.V3Field>
    </window.V3ModalShell>
  );
}

// ---- Invite team member ----
function V3M_InviteTeam({ close }) {
  const { toast } = window.useV3();
  const [f, setF] = _v3ms2({ name: '', email: '', perm: 'editor' });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const send = () => { toast(`ส่งคำเชิญถึง ${f.email || f.name} แล้ว`); close(); };
  return (
    <window.V3ModalShell title="เชิญสมาชิก" subtitle="ส่งลิงก์เชิญผ่านอีเมลหรือ LINE" close={close} footer={
      <>
        <button className="aw3-btn aw3-btn-ghost" onClick={close}>ยกเลิก</button>
        <button className="aw3-btn aw3-btn-hero" onClick={send} disabled={!f.email && !f.name}>ส่งคำเชิญ</button>
      </>
    }>
      <window.V3Field label="ชื่อ"><input className="aw3-input" value={f.name} onChange={e => set('name', e.target.value)}/></window.V3Field>
      <window.V3Field label="อีเมล"><input className="aw3-input" type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="example@email.com"/></window.V3Field>
      <window.V3Field label="สิทธิ์การใช้งาน">
        {[
          { id: 'admin', label: 'แอดมิน', desc: 'แก้ไขข้อมูลทั้งหมด + เชิญสมาชิก' },
          { id: 'editor', label: 'แก้ไขได้', desc: 'จัดการลูกค้า ล็อต และข้อความ' },
          { id: 'viewer', label: 'ดูเท่านั้น', desc: 'เปิดดูข้อมูลแต่แก้ไขไม่ได้' },
        ].map(p => (
          <div key={p.id} onClick={() => set('perm', p.id)} style={{
            padding: 14, marginBottom: 8, borderRadius: 'var(--r)',
            border: f.perm === p.id ? '1.5px solid var(--aw3-hero)' : '1.5px solid var(--aw3-line)',
            background: f.perm === p.id ? 'var(--aw3-hero-soft)' : '#fff',
            cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: f.perm === p.id ? '5px solid var(--aw3-hero)' : '2px solid var(--aw3-line-2)',
                background: '#fff',
              }}/>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{p.label}</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--aw3-ink-4)', marginTop: 4, marginLeft: 28 }}>{p.desc}</div>
          </div>
        ))}
      </window.V3Field>
    </window.V3ModalShell>
  );
}

// ---- Confirm Close Alert ----
function V3M_CloseAlert({ close, alert }) {
  const { closeAlert } = window.useV3();
  const [reason, setReason] = _v3ms2('แก้ไขแล้ว');
  return (
    <window.V3ModalShell title="ปิดเคสแจ้งเตือน" subtitle={alert?.title} close={close} footer={
      <>
        <button className="aw3-btn aw3-btn-ghost" onClick={close}>ยกเลิก</button>
        <button className="aw3-btn aw3-btn-hero" onClick={() => { closeAlert(alert.id); close(); }}>ปิดเคส</button>
      </>
    }>
      <window.V3Field label="เหตุผล">
        <select className="aw3-input" value={reason} onChange={e => setReason(e.target.value)}>
          <option>แก้ไขแล้ว</option><option>ติดต่อฟาร์มทุกแห่งแล้ว</option><option>เป็นการแจ้งเตือนผิด</option><option>เลื่อนไปเฝ้าระวัง</option>
        </select>
      </window.V3Field>
      <window.V3Field label="บันทึก (ไม่บังคับ)">
        <textarea className="aw3-input" rows={3} placeholder="เช่น ส่ง PCR ใหม่แล้วพบสะอาด"/>
      </window.V3Field>
    </window.V3ModalShell>
  );
}

// ---- Schedule call ----
function V3M_Schedule({ close, customer }) {
  const { toast } = window.useV3();
  const [day, setDay] = _v3ms2('พรุ่งนี้');
  const [time, setTime] = _v3ms2('09:00');
  const send = () => { toast(`นัดโทรหา ${customer?.farm || 'ลูกค้า'} ${day} ${time} น.`); close(); };
  return (
    <window.V3ModalShell title="นัดโทรกลับ" subtitle={customer?.farm} close={close} footer={
      <>
        <button className="aw3-btn aw3-btn-ghost" onClick={close}>ยกเลิก</button>
        <button className="aw3-btn aw3-btn-hero" onClick={send}>นัดเลย</button>
      </>
    }>
      <window.V3Field label="วัน">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['วันนี้','พรุ่งนี้','มะรืน','สัปดาห์หน้า','เลือกวัน'].map(d => (
            <button key={d} onClick={() => setDay(d)} style={{
              padding: '10px 14px', border: 0, borderRadius: 'var(--r)',
              background: day === d ? 'var(--aw3-hero)' : 'var(--aw3-soft)',
              color: day === d ? '#fff' : 'var(--aw3-ink-2)',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>{d}</button>
          ))}
        </div>
      </window.V3Field>
      <window.V3Field label="เวลา">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['08:00','09:00','10:00','13:00','15:00','17:00'].map(t => (
            <button key={t} onClick={() => setTime(t)} style={{
              padding: '8px 14px', border: 0, borderRadius: 'var(--r-pill)',
              background: time === t ? 'var(--aw3-ink)' : 'var(--aw3-soft)',
              color: time === t ? '#fff' : 'var(--aw3-ink-2)',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>{t}</button>
          ))}
        </div>
      </window.V3Field>
    </window.V3ModalShell>
  );
}

window.V3Modals = {
  addCustomer: V3M_AddCustomer,
  addBatch: V3M_AddBatch,
  sendLine: V3M_SendLine,
  quote: V3M_Quote,
  cert: V3M_Cert,
  invite: V3M_InviteTeam,
  closeAlert: V3M_CloseAlert,
  schedule: V3M_Schedule,
};
