/* global React, AW_DATA */
// H2/H3 hatchery webapp pages — H4 Customer Detail, H5 Batch Register,
// H6 Batch Detail, H7 Restock Predictor, H10 Settings, Onboarding wizard,
// H8 Public Scorecard, H9 Disease Alert

const { useState: useS2 } = React;
const { CUSTOMERS: CUSTS, BATCHES: BATS } = window.AW_DATA;

const Ic2 = ({ name, size = 18 }) => {
  const p = { width: size, height: size, fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const d = {
    back: 'M12 5l-5 5 5 5', mail: 'M3 5h14v10H3zM3 5l7 5 7-5',
    phone: 'M5 3h3l2 5-2 1a10 10 0 005 5l1-2 5 2v3a2 2 0 01-2 2A14 14 0 013 5a2 2 0 012-2z',
    line: 'M10 2a8 8 0 00-8 8 7 7 0 003 5.7v2l2.5-1.5A8 8 0 1010 2z',
    upload: 'M10 14V4m0 0l-4 4m4-4l4 4M3 16h14',
    file: 'M5 2h7l4 4v12H5zM12 2v4h4',
    plus: 'M10 4v12M4 10h12', check: 'M4 10l4 4 8-8',
    alert: 'M10 2L1 18h18L10 2zM10 8v4M10 16v.01',
    share: 'M14 7V4l5 5-5 5v-3H8a3 3 0 00-3 3v1H3v-1a5 5 0 015-5h6z',
    star: 'M10 2l2.5 5.5 6 .5-4.5 4 1.5 6L10 15l-5.5 3 1.5-6L1.5 8l6-.5L10 2z',
    chev: 'M7 5l5 5-5 5', filter: 'M3 5h14M5 10h10M8 15h4',
  };
  return <svg viewBox="0 0 20 20" {...p}><path d={d[name]||d.check}/></svg>;
};

const fmtTHB = (n) => '฿' + n.toLocaleString();
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB',
  { day:'2-digit',month:'short',year:'numeric'}) : '—';
const fmtShort = (d) => d ? new Date(d).toLocaleDateString('en-GB',
  { day:'2-digit',month:'short'}) : '—';

const PageHead = ({ title, sub, back, onBack, actions }) => (
  <div style={{ display:'flex', alignItems:'flex-end', marginBottom:24, gap:16 }}>
    <div style={{ flex:1 }}>
      {back && (
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:4,
          background:0, border:0, color:'var(--aw-ink-500)', cursor:'pointer',
          padding:0, fontSize:12.5, marginBottom:6, fontFamily:'inherit' }}>
          <Ic2 name="back" size={14}/>{back}
        </button>
      )}
      <h1 style={{ margin:0, fontFamily:'Plus Jakarta Sans', fontSize:28,
        fontWeight:700, letterSpacing:-0.6 }}>{title}</h1>
      {sub && <p style={{ margin:'4px 0 0', color:'var(--aw-ink-500)', fontSize:14 }}>{sub}</p>}
    </div>
    {actions}
  </div>
);

const Btn = ({ primary, ghost, children, icon, ...p }) => (
  <button {...p} style={{
    display:'inline-flex', alignItems:'center', gap:6, padding:'9px 14px',
    borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600,
    fontFamily:'inherit',
    border: primary ? 0 : '1px solid var(--aw-line-strong)',
    background: primary ? 'var(--aw-blue)' : ghost ? 'transparent' : 'var(--aw-card)',
    color: primary ? '#fff' : 'var(--aw-ink-700)',
    ...(p.style||{}),
  }}>{icon && <Ic2 name={icon} size={14}/>}{children}</button>
);

const Card = ({ title, action, children, padded = true }) => (
  <section style={{ background:'var(--aw-card)', borderRadius:14,
    border:'1px solid var(--aw-line)', overflow:'hidden' }}>
    {title && (
      <header style={{ padding:'14px 18px', display:'flex', alignItems:'center',
        borderBottom:'1px solid var(--aw-line)' }}>
        <h3 style={{ margin:0, fontFamily:'Plus Jakarta Sans', fontSize:14,
          fontWeight:600 }}>{title}</h3>
        {action && <div style={{ marginLeft:'auto' }}>{action}</div>}
      </header>
    )}
    <div style={{ padding: padded ? 18 : 0 }}>{children}</div>
  </section>
);

// ─── H4: Customer Detail ────────────────────────
function CustomerDetail({ lang, customerId = 'C001', onBack }) {
  const c = CUSTS.find(x => x.id === customerId) || CUSTS[0];
  const T = lang === 'th' ? {
    back:'← กลับไปหน้าลูกค้า', sub:`ลูกค้าตั้งแต่ ${fmtDate('2024-08-12')}`,
    msg:'ส่งข้อความใน LINE', cycles:'ประวัติรอบเลี้ยง', batch:'ล็อต',
    pl:'จำนวน PL', d30:'รอด D30', d60:'รอด D60', harvest:'ผลจับ',
    stock:'คาดว่าจะสั่งซ้ำใน', days:'วัน', confidence:'ความมั่นใจ',
    pred:'พยากรณ์การสั่งซ้ำ', contact:'ข้อมูลติดต่อ',
  } : {
    back:'← Back to customers', sub:`Customer since ${fmtDate('2024-08-12')}`,
    msg:'Message on LINE', cycles:'Cycle history', batch:'Batch',
    pl:'PL count', d30:'D30 surv.', d60:'D60 surv.', harvest:'Harvest',
    stock:'Likely to restock in', days:'days', confidence:'Confidence',
    pred:'Restock prediction', contact:'Contact',
  };

  const cycles = [
    { id:1, batch:'B-2604-A', date:'2026-04-22', pl:300_000, d30:84, d60:79, harvest:null, status:'active' },
    { id:2, batch:'B-2602-D', date:'2026-01-15', pl:280_000, d30:78, d60:71, harvest:'76% · 60s · ฿185', status:'closed' },
    { id:3, batch:'B-2511-A', date:'2025-10-08', pl:300_000, d30:81, d60:74, harvest:'72% · 50s · ฿210', status:'closed' },
    { id:4, batch:'B-2508-B', date:'2025-07-02', pl:250_000, d30:69, d60:62, harvest:'58% · 70s · ฿165', status:'closed' },
  ];

  return (
    <div style={{ padding:'28px 32px 60px', maxWidth:1240,
      fontFamily: lang==='th'?'Noto Sans Thai':'Inter' }}>
      <PageHead
        back={T.back} onBack={onBack}
        title={c.name}
        sub={`${lang==='th'?c.farm:c.farmEn} · ${c.zone} · ${T.sub}`}
        actions={<Btn icon="line">{T.msg}</Btn>}
      />

      {/* Top row: contact + restock prediction */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
        <Card title={T.contact}>
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'10px 16px',
            fontSize:13.5 }}>
            <span style={{ color:'var(--aw-ink-500)' }}>LINE</span>
            <span className="mono">@{c.id.toLowerCase()}_line</span>
            <span style={{ color:'var(--aw-ink-500)' }}>{lang==='th'?'จังหวัด':'Province'}</span>
            <span>{c.zone}</span>
            <span style={{ color:'var(--aw-ink-500)' }}>{lang==='th'?'จำนวนล็อตที่ซื้อ':'Batches purchased'}</span>
            <span><b className="tabular">{c.batches}</b></span>
            <span style={{ color:'var(--aw-ink-500)' }}>{lang==='th'?'มูลค่ารวม':'Lifetime value'}</span>
            <span style={{ fontFamily:'Plus Jakarta Sans', fontWeight:700, fontSize:16,
              color:'var(--aw-cyan)' }} className="tabular">{fmtTHB(c.ltv)}</span>
          </div>
        </Card>

        <Card title={T.pred}>
          <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
            <div style={{ fontFamily:'Plus Jakarta Sans', fontSize:42,
              fontWeight:700, color:'var(--aw-blue)', letterSpacing:-1, lineHeight:1 }}
              className="tabular">{c.restockIn ?? '—'}</div>
            <div style={{ fontSize:14, color:'var(--aw-ink-500)' }}>{T.days}</div>
          </div>
          <div style={{ fontSize:12.5, color:'var(--aw-ink-500)', marginTop:6 }}>
            {T.stock} · {lang==='th'?'อิงจาก 4 รอบล่าสุด ระยะเฉลี่ย 102 วัน':'based on last 4 cycles · avg 102 days'}
          </div>
          <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ flex:1, height:6, borderRadius:3, background:'var(--aw-paper-2)',
              overflow:'hidden' }}>
              <div style={{ width:'74%', height:'100%', background:'var(--aw-cyan)' }}/>
            </div>
            <span style={{ fontSize:11, fontFamily:'IBM Plex Mono',
              color:'var(--aw-ink-500)' }}>{T.confidence} · 74%</span>
          </div>
        </Card>
      </div>

      {/* Cycle history */}
      <Card title={T.cycles} padded={false}>
        <div style={{ display:'grid',
          gridTemplateColumns:'1fr 1.1fr 1fr 0.8fr 0.8fr 1.4fr',
          padding:'10px 18px', fontSize:11, color:'var(--aw-ink-500)',
          textTransform:'uppercase', letterSpacing:0.6, fontFamily:'Inter',
          background:'var(--aw-paper)', borderBottom:'1px solid var(--aw-line)' }}>
          <div>{lang==='th'?'วันที่':'Date'}</div>
          <div>{T.batch}</div>
          <div className="tabular">{T.pl}</div>
          <div>{T.d30}</div>
          <div>{T.d60}</div>
          <div>{T.harvest}</div>
        </div>
        {cycles.map((cy, i) => (
          <div key={cy.id} style={{
            display:'grid', gridTemplateColumns:'1fr 1.1fr 1fr 0.8fr 0.8fr 1.4fr',
            padding:'12px 18px', fontSize:13.5, alignItems:'center',
            borderBottom: i < cycles.length-1 ? '1px solid var(--aw-line)' : 0,
          }}>
            <div className="mono tabular">{fmtShort(cy.date)}</div>
            <div className="mono" style={{ fontWeight:600 }}>
              {cy.batch}
              {cy.status === 'active' && (
                <span style={{ marginLeft:6, fontSize:9.5, padding:'1px 6px', borderRadius:4,
                  background:'var(--aw-cyan-50)', color:'var(--aw-cyan)',
                  fontFamily:'IBM Plex Mono', letterSpacing:0.4, fontWeight:600 }}>LIVE</span>
              )}
            </div>
            <div className="mono tabular">{cy.pl.toLocaleString()}</div>
            <div>{cy.d30 ? <SurvChip pct={cy.d30}/> : <Dim/>}</div>
            <div>{cy.d60 ? <SurvChip pct={cy.d60}/> : <Dim/>}</div>
            <div className="mono" style={{ fontSize:12.5, color:'var(--aw-ink-700)' }}>
              {cy.harvest || (lang==='th'?'รอบกำลังดำเนินอยู่':'Cycle in progress')}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

const Dim = () => <span style={{ color:'var(--aw-ink-300)', fontSize:12 }}>—</span>;
const SurvChip = ({ pct }) => {
  const c = pct >= 75 ? {bg:'var(--aw-green-50)',fg:'var(--aw-green)'}
    : pct >= 60 ? {bg:'var(--aw-amber-50)',fg:'var(--aw-amber)'}
    : {bg:'var(--aw-red-50)',fg:'var(--aw-red)'};
  return <span className="mono tabular" style={{ display:'inline-block',
    padding:'2px 7px', borderRadius:5, background:c.bg, color:c.fg,
    fontSize:12, fontWeight:600 }}>{pct}%</span>;
};

// ─── H5: Batch Register ─────────────────────────
function BatchRegister({ lang, onBack }) {
  const T = lang==='th' ? {
    back:'← กลับ', title:'เพิ่มล็อตใหม่',
    sub:'บันทึกข้อมูลล็อตและอัพโหลดผล PCR — สำหรับห้องแล็บและเจ้าของ',
    secMeta:'ข้อมูลล็อต', secLab:'ผลแล็บและไฟล์',
    bid:'รหัสล็อต', source:'แหล่งพ่อแม่พันธุ์', date:'วันที่ออก',
    plProd:'จำนวน PL ที่ผลิต', stage:'ระยะ', notes:'หมายเหตุ',
    pcr:'รายงาน PCR', stress:'คะแนน Stress test', photos:'ภาพถ่ายล็อต',
    drop:'ลากไฟล์มาวาง หรือ คลิกเพื่อเลือก', fmt:'PDF, JPG, PNG · สูงสุด 10MB',
    save:'บันทึกล็อต', cancel:'ยกเลิก',
  } : {
    back:'← Back', title:'Add new batch',
    sub:'Record batch metadata and upload PCR results — for lab tech and owner',
    secMeta:'Batch metadata', secLab:'Lab results & files',
    bid:'Batch ID', source:'Broodstock source', date:'Pack date',
    plProd:'PL count produced', stage:'Stage', notes:'Notes',
    pcr:'PCR report', stress:'Stress test score', photos:'Batch photos',
    drop:'Drop files or click to upload', fmt:'PDF, JPG, PNG · max 10MB',
    save:'Save batch', cancel:'Cancel',
  };

  return (
    <div style={{ padding:'28px 32px 60px', maxWidth:980,
      fontFamily: lang==='th'?'Noto Sans Thai':'Inter' }}>
      <PageHead back={T.back} onBack={onBack} title={T.title} sub={T.sub}/>

      <Card title={T.secMeta}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <Inp lbl={T.bid} value="B-2605-A" mono/>
          <Inp lbl={T.date} value="26 Apr 2026" mono/>
          <Inp lbl={T.source} value="CP-Genetics Line A" full/>
          <Inp lbl={T.plProd} value="2,400,000" mono unit={lang==='th'?'ตัว':'PL'}/>
          <Inp lbl={T.stage} value="PL-12" mono/>
        </div>
      </Card>

      <div style={{ height:18 }}/>

      <Card title={T.secLab}>
        <div style={{ marginBottom:16 }}>
          <Lbl>{T.pcr}</Lbl>
          <DropZone primary T={T}>
            <FilePill name="PCR-EHP-WSSV-IHHNV.pdf" size="2.4 MB" type="pdf"/>
            <FilePill name="PCR-AHPND-TPD.pdf" size="1.8 MB" type="pdf"/>
          </DropZone>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16,
          marginBottom:16 }}>
          <Inp lbl={`${T.stress} (formalin)`} value="92" mono unit="/100"/>
          <Inp lbl={`${T.stress} (salinity drop)`} value="88" mono unit="/100"/>
        </div>
        <div>
          <Lbl>{T.photos}</Lbl>
          <DropZone T={T}>
            <FilePill name="batch-tank-A1.jpg" size="3.1 MB" type="img"/>
            <FilePill name="batch-tank-A2.jpg" size="2.9 MB" type="img"/>
          </DropZone>
        </div>
      </Card>

      <div style={{ display:'flex', gap:10, marginTop:18, justifyContent:'flex-end' }}>
        <Btn ghost>{T.cancel}</Btn>
        <Btn primary icon="check">{T.save}</Btn>
      </div>
    </div>
  );
}

const Lbl = ({ children }) => (
  <div style={{ fontSize:11, color:'var(--aw-ink-500)',
    textTransform:'uppercase', letterSpacing:0.6, fontFamily:'Inter',
    fontWeight:500, marginBottom:6 }}>{children}</div>
);

function Inp({ lbl, value, mono, unit, full }) {
  return (
    <div style={{ gridColumn: full?'span 2':'auto' }}>
      <Lbl>{lbl}</Lbl>
      <div style={{ display:'flex', alignItems:'center', gap:6,
        padding:'10px 12px', borderRadius:8, background:'var(--aw-paper)',
        border:'1px solid var(--aw-line-strong)' }}>
        <span style={{ flex:1, fontSize:14, fontWeight:600,
          fontFamily: mono?'IBM Plex Mono':'inherit',
          fontVariantNumeric:'tabular-nums', color:'var(--aw-ink-900)' }}>
          {value}
        </span>
        {unit && <span style={{ fontSize:12, color:'var(--aw-ink-500)' }}>{unit}</span>}
      </div>
    </div>
  );
}

function DropZone({ primary, T, children }) {
  return (
    <div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:10 }}>
        {children}
      </div>
      <div style={{
        border:'1.5px dashed ' + (primary ? 'var(--aw-blue)' : 'var(--aw-line-strong)'),
        borderRadius:10, padding:'18px', textAlign:'center',
        background: primary ? 'var(--aw-blue-50)' : 'var(--aw-paper)',
        color: primary ? 'var(--aw-blue)' : 'var(--aw-ink-500)',
        cursor:'pointer',
      }}>
        <Ic2 name="upload" size={20}/>
        <div style={{ fontSize:13.5, fontWeight:600, marginTop:6 }}>{T.drop}</div>
        <div style={{ fontSize:11.5, marginTop:3, fontFamily:'IBM Plex Mono',
          opacity:0.7 }}>{T.fmt}</div>
      </div>
    </div>
  );
}

function FilePill({ name, size, type }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:8,
      padding:'7px 11px 7px 9px', borderRadius:8,
      background:'var(--aw-card)', border:'1px solid var(--aw-line)',
      fontSize:12.5 }}>
      <div style={{
        width:24, height:24, borderRadius:5,
        background: type==='pdf'?'#FCE9E4':'#EAF1FB',
        color: type==='pdf'?'#B5371E':'#004AAD',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'IBM Plex Mono', fontWeight:700, fontSize:9,
      }}>{type==='pdf'?'PDF':'IMG'}</div>
      <span style={{ fontWeight:500 }}>{name}</span>
      <span style={{ color:'var(--aw-ink-400)', fontFamily:'IBM Plex Mono',
        fontSize:11 }}>{size}</span>
    </div>
  );
}

// ─── H6: Batch Detail & Certificate Generator ───
function BatchDetail({ lang, onBack }) {
  const b = BATS[0];
  const T = lang==='th' ? {
    back:'← ทะเบียนล็อต', sub:`ออกเมื่อ ${fmtDate(b.date)} · ${b.source}`,
    gen:'ออกใบรับรองให้ลูกค้า', sold:'ขายแล้ว', remain:'คงเหลือ',
    pcr:'ผลตรวจ PCR', allClean:'ปลอดเชื้อทั้งหมด',
    farms:'ฟาร์มที่ได้รับ', perf:'ผลสะสมของล็อต',
    meanD30:'รอด D30 เฉลี่ย', vsHatch:'เทียบค่าเฉลี่ยฟ้าใส',
  } : {
    back:'← Batch register', sub:`Issued ${fmtDate(b.date)} · ${b.source}`,
    gen:'Generate customer certificate', sold:'Sold', remain:'Remaining',
    pcr:'PCR results', allClean:'All clean',
    farms:'Customers receiving this batch', perf:'Cumulative batch performance',
    meanD30:'Mean D30 survival', vsHatch:'vs hatchery average',
  };
  const remain = b.plProduced - b.plSold;

  return (
    <div style={{ padding:'28px 32px 60px', maxWidth:1240,
      fontFamily: lang==='th'?'Noto Sans Thai':'Inter' }}>
      <PageHead back={T.back} onBack={onBack}
        title={<span className="mono" style={{ letterSpacing:1 }}>{b.id}</span>}
        sub={T.sub}
        actions={<Btn primary icon="share">{T.gen}</Btn>}
      />

      {/* KPI strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14,
        marginBottom:18 }}>
        <KPI2 lbl={lang==='th'?'PL ผลิต':'PL produced'} value={(b.plProduced/1e6).toFixed(1)+'M'} sub={b.plProduced.toLocaleString()}/>
        <KPI2 lbl={T.sold} value={(b.plSold/1e6).toFixed(2)+'M'} sub={`${Math.round(b.plSold/b.plProduced*100)}%`}/>
        <KPI2 lbl={T.remain} value={(remain/1000).toFixed(0)+'K'} sub={remain.toLocaleString()}/>
        <KPI2 lbl={T.farms} value={b.farms} sub={lang==='th'?'4 จังหวัด':'4 provinces'} accent="cyan"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:18 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <Card title={T.pcr}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <Ic2 name="check" size={18}/>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--aw-green)' }}>
                {T.allClean}
              </div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {['EHP','WSSV','IHHNV','AHPND','TPD'].map(p =>
                <window.PathogenBadge key={p} name={p} clean/>)}
            </div>
            <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--aw-line)',
              fontSize:11.5, color:'var(--aw-ink-500)' }}>
              <FilePill name="PCR-EHP-WSSV-IHHNV.pdf" size="2.4 MB" type="pdf"/>
            </div>
          </Card>

          <Card title={T.perf}>
            <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
              <span style={{ fontFamily:'Plus Jakarta Sans', fontSize:36,
                fontWeight:700, color:'var(--aw-cyan)', letterSpacing:-0.6 }}
                className="tabular">{b.meanD30}%</span>
              <span style={{ fontSize:13, color:'var(--aw-ink-500)' }}>{T.meanD30}</span>
            </div>
            <div style={{ fontSize:12, color:'var(--aw-green)', marginTop:4,
              fontFamily:'IBM Plex Mono' }}>
              ▲ +6pt {T.vsHatch}
            </div>
            <div style={{ marginTop:14 }}>
              <window.DistBar buckets={b.dist} height={48} accent="#008B8B"/>
              <div style={{ display:'flex', justifyContent:'space-between',
                fontSize:10, color:'var(--aw-ink-400)', fontFamily:'IBM Plex Mono',
                marginTop:4 }}>
                <span>50%</span><span>70%</span><span>90%</span>
              </div>
            </div>
          </Card>
        </div>

        <Card title={T.farms} padded={false}>
          {[
            ['สมชาย ใจดี','ฟาร์มกุ้งบ้านสวน','Day 78', 84],
            ['ประยุทธ พงษ์ศรี','พงษ์ศรีฟาร์ม','Day 24', null],
            ['ธนากร เกษตรทรัพย์','เกษตรทรัพย์ฟาร์ม','Day 8', null],
            ['อนันต์ สุขสบาย','สุขสบายฟาร์ม','Day 35', 88],
            ['รัชนี โพธิ์ทอง','โพธิ์ทองฟาร์ม','Day 42', 79],
            ['วิภา ทองสุข','ทองสุขฟาร์ม','Day 65', 42],
          ].map(([n, f, d, s], i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'1.6fr 1fr 0.7fr',
              padding:'12px 18px', alignItems:'center', fontSize:13.5,
              borderBottom: i<5?'1px solid var(--aw-line)':0,
            }}>
              <div>
                <div style={{ fontWeight:600 }}>{n}</div>
                <div style={{ fontSize:12, color:'var(--aw-ink-500)' }}>{f}</div>
              </div>
              <div className="mono" style={{ fontSize:12.5,
                color:'var(--aw-ink-700)' }}>{d}</div>
              <div style={{ textAlign:'right' }}>
                {s !== null ? <SurvChip pct={s}/> :
                  <span style={{ fontSize:11, color:'var(--aw-ink-400)' }}>
                    {lang==='th'?'รอ D30':'pending D30'}
                  </span>}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

const KPI2 = ({ lbl, value, sub, accent='blue' }) => {
  const c = accent==='cyan'?'var(--aw-cyan)':'var(--aw-blue)';
  return (
    <div style={{ background:'var(--aw-card)', borderRadius:14, padding:'14px 16px',
      border:'1px solid var(--aw-line)' }}>
      <Lbl>{lbl}</Lbl>
      <div style={{ fontFamily:'Plus Jakarta Sans', fontSize:24, fontWeight:700,
        color:c, letterSpacing:-0.5, fontVariantNumeric:'tabular-nums' }}>{value}</div>
      <div style={{ fontSize:11.5, color:'var(--aw-ink-500)',
        fontFamily:'IBM Plex Mono', marginTop:2 }}>{sub}</div>
    </div>
  );
};

// ─── H7: Restock Predictor ─────────────────────
function RestockPredictor({ lang, onBack }) {
  const T = lang==='th' ? {
    back:'← กลับ', title:'พยากรณ์การสั่งซ้ำ',
    sub:'ลูกค้าใกล้ต้องการ PL — เรียงตามวันที่คาดว่าจะสั่ง',
    today:'โทรวันนี้', wk:'สัปดาห์นี้', m:'เดือนนี้', after:'หลังจากนั้น',
    name:'ลูกค้า', cycle:'รอบเลี้ยง', harvest:'จับ', restock:'คาดสั่งซ้ำ',
    vol:'ปริมาณคาด', conf:'ความมั่นใจ', call:'โทรแล้ว', reord:'สั่งแล้ว',
  } : {
    back:'← Back', title:'Restock predictor',
    sub:'Customers about to need PL — sorted by predicted reorder date',
    today:'Call today', wk:'This week', m:'This month', after:'Later',
    name:'Customer', cycle:'Cycle', harvest:'Harvest', restock:'Predicted reorder',
    vol:'Predicted volume', conf:'Confidence', call:'Called', reord:'Reordered',
  };

  const rows = [
    { c:CUSTS[6], when:0, vol:300, conf:0.86, status:'today' },
    { c:CUSTS[2], when:4, vol:250, conf:0.78, status:'today' },
    { c:CUSTS[0], when:14, vol:300, conf:0.74, status:'wk' },
    { c:CUSTS[8], when:32, vol:280, conf:0.66, status:'m' },
    { c:CUSTS[4], when:38, vol:200, conf:0.52, status:'m' },
    { c:CUSTS[3], when:78, vol:300, conf:0.42, status:'after' },
  ];
  const groups = [
    { id:'today', label:T.today, tone:'amber' },
    { id:'wk', label:T.wk, tone:'blue' },
    { id:'m', label:T.m, tone:'cyan' },
    { id:'after', label:T.after, tone:'gray' },
  ];

  return (
    <div style={{ padding:'28px 32px 60px', maxWidth:1240,
      fontFamily: lang==='th'?'Noto Sans Thai':'Inter' }}>
      <PageHead back={T.back} onBack={onBack} title={T.title} sub={T.sub}/>

      <div style={{ display:'flex', gap:14, marginBottom:18 }}>
        <SumPill label={T.today} value={rows.filter(r=>r.status==='today').length} tone="amber"/>
        <SumPill label={T.wk} value={rows.filter(r=>r.status==='wk').length} tone="blue"/>
        <SumPill label={T.m} value={rows.filter(r=>r.status==='m').length} tone="cyan"/>
        <div style={{ flex:1 }}/>
        <Btn icon="filter">{lang==='th'?'ตัวกรอง':'Filters'}</Btn>
      </div>

      {groups.map(g => {
        const items = rows.filter(r => r.status === g.id);
        if (!items.length) return null;
        const tones = {
          amber:{bg:'var(--aw-amber-50)',fg:'var(--aw-amber)',dot:'#B5790E'},
          blue:{bg:'var(--aw-blue-50)',fg:'var(--aw-blue)',dot:'#004AAD'},
          cyan:{bg:'var(--aw-cyan-50)',fg:'var(--aw-cyan)',dot:'#008B8B'},
          gray:{bg:'var(--aw-paper-2)',fg:'var(--aw-ink-500)',dot:'#8E8E84'},
        }[g.tone];
        return (
          <div key={g.id} style={{ marginBottom:18 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8,
              padding:'10px 14px', background:tones.bg, color:tones.fg,
              borderRadius:'8px 8px 0 0', fontSize:13, fontWeight:600,
              border:'1px solid var(--aw-line)', borderBottom:0 }}>
              <span style={{ width:8, height:8, borderRadius:4, background:tones.dot }}/>
              {g.label}
              <span className="mono tabular" style={{ fontSize:11, opacity:0.7 }}>
                {items.length}
              </span>
            </div>
            <div style={{ background:'var(--aw-card)', borderRadius:'0 0 8px 8px',
              border:'1px solid var(--aw-line)', overflow:'hidden' }}>
              <div style={{ display:'grid',
                gridTemplateColumns:'1.6fr 1fr 0.9fr 1fr 1fr 0.9fr 1.3fr',
                padding:'9px 18px', fontSize:11, color:'var(--aw-ink-500)',
                textTransform:'uppercase', letterSpacing:0.6, fontFamily:'Inter',
                background:'var(--aw-paper)' }}>
                <div>{T.name}</div><div>{T.cycle}</div>
                <div className="tabular">{T.harvest}</div>
                <div>{T.restock}</div>
                <div className="tabular">{T.vol}</div>
                <div>{T.conf}</div><div></div>
              </div>
              {items.map((r, i) => (
                <div key={r.c.id} style={{
                  display:'grid', gridTemplateColumns:'1.6fr 1fr 0.9fr 1fr 1fr 0.9fr 1.3fr',
                  padding:'12px 18px', alignItems:'center', fontSize:13.5,
                  borderTop: i>0?'1px solid var(--aw-line)':0,
                }}>
                  <div>
                    <div style={{ fontWeight:600 }}>{r.c.name}</div>
                    <div style={{ fontSize:12, color:'var(--aw-ink-500)' }}>
                      {lang==='th'?r.c.farm:r.c.farmEn} · {r.c.zone}
                    </div>
                  </div>
                  <div><window.CycleDot day={r.c.cycleDay||0}/></div>
                  <div className="mono tabular" style={{ fontSize:12.5,
                    color:'var(--aw-ink-700)' }}>{fmtShort(r.c.expectedHarvest)}</div>
                  <div style={{ fontFamily:'Plus Jakarta Sans', fontWeight:700,
                    color: r.when===0?'var(--aw-amber)':r.when<14?'var(--aw-blue)':'var(--aw-ink-900)' }}>
                    {r.when===0 ? (lang==='th'?'วันนี้':'Today')
                      : r.when<7 ? `${lang==='th'?'อีก':'in'} ${r.when} ${lang==='th'?'วัน':'days'}`
                      : (lang==='th'?'ราว ':'~') + Math.round(r.when/7) + ' ' + (lang==='th'?'สัปดาห์':'wks')}
                  </div>
                  <div className="tabular" style={{ fontFamily:'IBM Plex Mono',
                    fontSize:13 }}>{r.vol}K {lang==='th'?'ตัว':'PL'}</div>
                  <div>
                    <div style={{ height:5, borderRadius:3, background:'var(--aw-paper-2)',
                      overflow:'hidden', width:60 }}>
                      <div style={{ width:`${r.conf*100}%`, height:'100%',
                        background: r.conf > 0.7?'var(--aw-cyan)':r.conf > 0.5?'var(--aw-blue)':'var(--aw-ink-400)' }}/>
                    </div>
                    <div style={{ fontSize:10, color:'var(--aw-ink-500)',
                      fontFamily:'IBM Plex Mono', marginTop:2 }}>
                      {Math.round(r.conf*100)}%
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <Btn icon="phone" style={{ padding:'6px 10px', fontSize:12 }}>{T.call}</Btn>
                    <Btn ghost style={{ padding:'6px 10px', fontSize:12 }}>{T.reord}</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const SumPill = ({ label, value, tone }) => {
  const tones = {
    amber:{bg:'var(--aw-amber-50)',fg:'var(--aw-amber)'},
    blue:{bg:'var(--aw-blue-50)',fg:'var(--aw-blue)'},
    cyan:{bg:'var(--aw-cyan-50)',fg:'var(--aw-cyan)'},
  }[tone];
  return (
    <div style={{ padding:'10px 16px', borderRadius:10, background:tones.bg }}>
      <div style={{ fontSize:11, color:tones.fg, fontWeight:600,
        textTransform:'uppercase', letterSpacing:0.6,
        fontFamily:'Inter' }}>{label}</div>
      <div style={{ fontFamily:'Plus Jakarta Sans', fontSize:24, fontWeight:700,
        color:tones.fg, lineHeight:1.1, marginTop:2 }} className="tabular">{value}</div>
    </div>
  );
};

// ─── H8: Public Scorecard ───────────────────────
function PublicScorecard({ lang }) {
  const T = lang==='th' ? {
    head:'การ์ดคะแนนสาธารณะ', verified:'ตรวจสอบโดย AquaWise',
    period:'ข้อมูล 12 เดือนล่าสุด · 47 ล็อต · 23 ฟาร์ม',
    meanD30:'รอด D30 เฉลี่ย', meanH:'รอดที่จับเฉลี่ย', adg:'ADG เฉลี่ย',
    bench:'เทียบสมาคมแฮทเชอรี่ภาคกลาง', above:'สูงกว่ามัธยฐาน',
    note:'หมายเหตุ: AquaWise ไม่เปิดเผยอันดับที่แน่นอน — เพื่อสนับสนุนการแข่งขันที่เป็นธรรม',
    share:'คัดลอกลิงก์', verify:'ตรวจสอบที่ aquawise.co.th/h/fasai',
  } : {
    head:'Public scorecard', verified:'Verified by AquaWise',
    period:'Last 12 months · 47 batches · 23 farms',
    meanD30:'Mean D30 survival', meanH:'Mean harvest survival', adg:'Mean ADG',
    bench:'Vs Central Hatchery Association', above:'Above median',
    note:'Note: AquaWise does not publish exact ranks — to encourage fair competition.',
    share:'Copy link', verify:'Verify at aquawise.co.th/h/fasai',
  };

  return (
    <div style={{ padding:'28px 32px 60px', maxWidth:880,
      fontFamily: lang==='th'?'Noto Sans Thai':'Inter' }}>
      <div style={{
        background:'var(--aw-card)', borderRadius:16,
        border:'1px solid var(--aw-line)', overflow:'hidden',
        boxShadow:'var(--shadow-md)',
      }}>
        {/* Header */}
        <div style={{ padding:'28px 32px 24px',
          background:'linear-gradient(135deg,#FAF8F4,#F3EFE7)',
          borderBottom:'1px solid var(--aw-line)' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:18 }}>
            <window.AW_Stamp size={84} label="VERIFIED"/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontFamily:'IBM Plex Mono',
                color:'var(--aw-cyan)', letterSpacing:1.2, fontWeight:600,
                textTransform:'uppercase', marginBottom:6 }}>
                {T.head}
              </div>
              <h1 style={{ margin:0, fontFamily:'Plus Jakarta Sans',
                fontSize:32, fontWeight:700, letterSpacing:-0.6 }}>
                ฟ้าใส แฮทเชอรี่
              </h1>
              <div style={{ fontSize:13, color:'var(--aw-ink-500)', marginTop:4 }}>
                Fasai Hatchery · สมุทรสาคร · {T.period}
              </div>
            </div>
            <Btn icon="share">{T.share}</Btn>
          </div>
        </div>

        {/* Big numbers */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)',
          padding:'24px 0', borderBottom:'1px solid var(--aw-line)' }}>
          <BigStat label={T.meanD30} value="79" unit="%" trend={[71,74,76,77,79,79]}/>
          <BigStat label={T.meanH} value="73" unit="%" trend={[68,70,71,72,73,73]} divider/>
          <BigStat label={T.adg} value="0.21" unit="g/d" trend={[0.18,0.19,0.20,0.20,0.21,0.21]} divider/>
        </div>

        {/* Benchmark */}
        <div style={{ padding:'22px 32px' }}>
          <div style={{ fontSize:11, color:'var(--aw-ink-500)',
            textTransform:'uppercase', letterSpacing:0.6, fontFamily:'Inter',
            fontWeight:500, marginBottom:10 }}>{T.bench}</div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{
              padding:'6px 12px', borderRadius:999,
              background:'var(--aw-green-50)', color:'var(--aw-green)',
              fontSize:13, fontWeight:600,
            }}>✓ {T.above}</div>
            <div style={{ flex:1, position:'relative', height:32 }}>
              <div style={{ position:'absolute', top:14, left:0, right:0,
                height:4, borderRadius:2, background:'var(--aw-paper-2)' }}/>
              <div style={{ position:'absolute', top:14, left:'50%', width:1,
                height:14, background:'var(--aw-ink-300)' }}/>
              <div style={{ position:'absolute', top:0, left:'50%',
                fontSize:10, color:'var(--aw-ink-400)',
                fontFamily:'IBM Plex Mono', transform:'translateX(-50%)' }}>median</div>
              <div style={{ position:'absolute', top:10, left:'72%',
                width:14, height:14, borderRadius:7, background:'var(--aw-cyan)',
                boxShadow:'0 0 0 4px rgba(0,139,139,0.15)',
                transform:'translateX(-50%)' }}/>
            </div>
          </div>
          <div style={{ fontSize:12, color:'var(--aw-ink-500)', marginTop:14,
            lineHeight:1.55 }}>
            <Ic2 name="alert" size={11}/> {T.note}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'14px 32px',
          background:'var(--aw-paper)', borderTop:'1px solid var(--aw-line)',
          fontSize:11, color:'var(--aw-ink-500)', fontFamily:'IBM Plex Mono',
          display:'flex', alignItems:'center', gap:12,
        }}>
          <Ic2 name="check" size={12}/> {T.verified} · {T.verify}
          <span style={{ marginLeft:'auto' }}>ID: AW-H-FASAI-2026-04</span>
        </div>
      </div>
    </div>
  );
}

const BigStat = ({ label, value, unit, trend, divider }) => (
  <div style={{ padding:'0 28px',
    borderLeft: divider?'1px solid var(--aw-line)':0 }}>
    <div style={{ fontSize:11, color:'var(--aw-ink-500)',
      textTransform:'uppercase', letterSpacing:0.6, fontFamily:'Inter',
      fontWeight:500, marginBottom:6 }}>{label}</div>
    <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
      <span style={{ fontFamily:'Plus Jakarta Sans', fontSize:46,
        fontWeight:700, letterSpacing:-1, color:'var(--aw-blue)',
        fontVariantNumeric:'tabular-nums' }}>{value}</span>
      <span style={{ fontSize:18, color:'var(--aw-ink-500)' }}>{unit}</span>
    </div>
    <div style={{ marginTop:6 }}>
      <window.Trend values={trend} color="#008B8B" width={120} height={26}/>
    </div>
  </div>
);

// ─── H9: Disease Traceback Alert ──────────────
function DiseaseAlert({ lang, onBack }) {
  const T = lang==='th' ? {
    back:'← กลับ', title:'แจ้งเตือนการสืบกลับโรค',
    sub:'มีสัญญาณการระบาดในฟาร์มลูกค้าที่ได้รับล็อตจากคุณ',
    sev:'ระดับ A · ต้องการการตอบสนอง',
    overview:'ภาพรวมล็อต', risk:'ฟาร์มที่มีความเสี่ยง',
    actions:'การดำเนินการที่แนะนำ',
    private:'แจ้งเฉพาะภายในเท่านั้น — การเปิดเผยต่อสาธารณะเป็นการตัดสินใจแยกต่างหาก',
    a1:'โทรหาฟาร์มที่ได้รับผลกระทบทั้ง 3 แห่งภายใน 24 ชม.',
    a2:'ตรวจสอบตัวอย่างเก็บกัก — PCR ซ้ำ',
    a3:'ระงับการขายล็อต B-2603-D ที่เหลือชั่วคราว',
  } : {
    back:'← Back', title:'Disease traceback alert',
    sub:'Outbreak signals detected at customer farms receiving your batch',
    sev:'Severity A · Action required',
    overview:'Batch overview', risk:'At-risk farms',
    actions:'Recommended actions',
    private:'Internal alert only — public disclosure is a separate decision.',
    a1:'Call all 3 affected farms within 24h',
    a2:'Re-PCR retained samples from the batch',
    a3:'Pause sale of remaining B-2603-D inventory',
  };

  return (
    <div style={{ padding:'28px 32px 60px', maxWidth:1080,
      fontFamily: lang==='th'?'Noto Sans Thai':'Inter' }}>
      <PageHead back={T.back} onBack={onBack} title={T.title} sub={T.sub}/>

      {/* Severity banner */}
      <div style={{
        padding:'16px 20px', borderRadius:12,
        background:'linear-gradient(90deg,#FCE9E4,#FBF1DC)',
        border:'1px solid #F0C9C0', marginBottom:18,
        display:'flex', alignItems:'center', gap:14,
      }}>
        <div style={{
          width:42, height:42, borderRadius:21, background:'#B5371E',
          color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
        }}><Ic2 name="alert" size={22}/></div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, fontFamily:'IBM Plex Mono',
            color:'#8E2A14', letterSpacing:0.6, fontWeight:600 }}>
            ALERT · 26 APR 2026 · 14:08
          </div>
          <div style={{ fontSize:16, fontWeight:700, color:'#1A1A17', marginTop:2 }}>
            {T.sev}
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18,
        marginBottom:18 }}>
        <Card title={T.overview}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <Field42 lbl="Batch ID" value="B-2603-D" mono/>
            <Field42 lbl={lang==='th'?'แหล่งพ่อแม่พันธุ์':'Source'} value="Shrimp Improvement Sys."/>
            <Field42 lbl={lang==='th'?'ฟาร์มทั้งหมด':'Farms'} value="4"/>
            <Field42 lbl={lang==='th'?'รายงานผิดปกติ':'Abnormal reports'} value="3" tone="red"/>
            <Field42 lbl={lang==='th'?'รอด D30 เฉลี่ย':'Mean D30'} value="68%" tone="amber"/>
            <Field42 lbl={lang==='th'?'สัญญาณ':'Signal'} value="EHP" tone="red"/>
          </div>
        </Card>

        <Card title={T.actions}>
          {[T.a1, T.a2, T.a3].map((a, i) => (
            <div key={i} style={{
              display:'flex', gap:11, padding:'10px 0',
              borderBottom: i<2?'1px solid var(--aw-line)':0,
            }}>
              <div style={{ width:22, height:22, borderRadius:11,
                background:'var(--aw-blue-50)', color:'var(--aw-blue)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:700, fontSize:11.5,
                fontFamily:'IBM Plex Mono', flexShrink:0 }}>{i+1}</div>
              <div style={{ flex:1, fontSize:13.5, lineHeight:1.5 }}>{a}</div>
              <Btn ghost style={{ padding:'4px 10px', fontSize:11 }}>
                {lang==='th'?'เริ่ม':'Start'}
              </Btn>
            </div>
          ))}
        </Card>
      </div>

      <Card title={T.risk} padded={false}>
        {[
          ['สมศรี เจริญสุข','เจริญสุขฟาร์ม','Day 28', 32, 'EHP suspected'],
          ['บุญเลิศ ทองดี','ทองดีฟาร์ม','Day 32', 41, 'High mortality'],
          ['อรุณ พงษ์เทียน','พงษ์เทียนฟาร์ม','Day 30', 52, 'Slow growth'],
          ['สุกัญญา รุ่งเรือง','รุ่งเรืองฟาร์ม','Day 29', 78, '— normal —'],
        ].map(([n, f, d, s, sig], i) => (
          <div key={i} style={{
            display:'grid', gridTemplateColumns:'1.6fr 1.2fr 0.8fr 0.7fr 1.2fr 1fr',
            padding:'12px 18px', alignItems:'center', fontSize:13.5,
            borderBottom: i<3?'1px solid var(--aw-line)':0,
            background: s < 60 ? 'var(--aw-red-50)' : 'transparent',
          }}>
            <div style={{ fontWeight:600 }}>{n}</div>
            <div style={{ fontSize:12.5, color:'var(--aw-ink-700)' }}>{f}</div>
            <div className="mono" style={{ fontSize:12.5 }}>{d}</div>
            <div><SurvChip pct={s}/></div>
            <div style={{ fontSize:12, color: s<60?'var(--aw-red)':'var(--aw-ink-500)',
              fontFamily:'IBM Plex Mono' }}>{sig}</div>
            <div style={{ display:'flex', gap:6 }}>
              <Btn icon="phone" style={{ padding:'5px 9px', fontSize:11.5 }}>
                {lang==='th'?'โทร':'Call'}
              </Btn>
            </div>
          </div>
        ))}
      </Card>

      <div style={{ marginTop:14, fontSize:11.5, color:'var(--aw-ink-500)',
        fontFamily:'IBM Plex Mono', display:'flex', alignItems:'center', gap:6 }}>
        <Ic2 name="alert" size={12}/> {T.private}
      </div>
    </div>
  );
}

const Field42 = ({ lbl, value, mono, tone }) => (
  <div>
    <Lbl>{lbl}</Lbl>
    <div style={{ fontSize:15, fontWeight:600,
      fontFamily: mono?'IBM Plex Mono':'Plus Jakarta Sans',
      color: tone==='red'?'var(--aw-red)':tone==='amber'?'var(--aw-amber)':'var(--aw-ink-900)',
      fontVariantNumeric:'tabular-nums', marginTop:2 }}>{value}</div>
  </div>
);

// ─── H10: Settings ─────────────────────────────
function Settings({ lang }) {
  const [scorecardPublic, setSP] = useS2(true);
  const T = lang==='th' ? {
    title:'ตั้งค่าและการแชร์', sub:'จัดการบัญชี การแจ้งเตือน และการแชร์ข้อมูล',
    profile:'ข้อมูลแฮทเชอรี่', notif:'การแจ้งเตือน',
    public:'การ์ดคะแนนสาธารณะ', data:'ข้อมูลและสำรอง',
    spOn:'เปิดให้ลูกค้าและโบรกเกอร์ดูผลการดำเนินงานของคุณ',
    spOff:'ผู้ใช้ภายนอกจะเห็นว่าคุณอยู่ในระบบแต่ยังไม่เปิดการ์ด',
    export:'ส่งออกข้อมูล (CSV)', download:'ดาวน์โหลด',
  } : {
    title:'Settings & sharing', sub:'Account, notifications, and data sharing',
    profile:'Hatchery profile', notif:'Notifications',
    public:'Public scorecard', data:'Data export',
    spOn:'Customers and brokers can view your scorecard',
    spOff:'Outside users see you are in the system but no scorecard',
    export:'Export data (CSV)', download:'Download',
  };

  return (
    <div style={{ padding:'28px 32px 60px', maxWidth:880,
      fontFamily: lang==='th'?'Noto Sans Thai':'Inter' }}>
      <PageHead title={T.title} sub={T.sub}/>

      <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
        <Card title={T.profile}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <Inp lbl={lang==='th'?'ชื่อแฮทเชอรี่':'Name'} value="ฟ้าใส แฮทเชอรี่"/>
            <Inp lbl={lang==='th'?'จังหวัด':'Province'} value="สมุทรสาคร"/>
            <Inp lbl={lang==='th'?'กำลังการผลิต':'Capacity'} value="120M PL/yr" mono/>
            <Inp lbl={lang==='th'?'แหล่งพ่อแม่พันธุ์':'Broodstock sources'} value="3"/>
          </div>
        </Card>

        <Card title={T.notif}>
          {[
            ['LINE', lang==='th'?'แจ้งเตือนเร่งด่วน (สืบกลับโรค ราคา)':'Time-sensitive (disease, prices)', true],
            [lang==='th'?'อีเมล':'Email', lang==='th'?'สรุปประจำสัปดาห์':'Weekly digest', true],
            [lang==='th'?'ในแอป':'In-app', lang==='th'?'อัพเดทรอบเลี้ยง':'Cycle updates', true],
            ['SMS', lang==='th'?'สำรอง — เมื่อ LINE ใช้ไม่ได้':'Fallback when LINE fails', false],
          ].map(([k, d, on], i) => (
            <Toggle key={i} title={k} desc={d} on={on}/>
          ))}
        </Card>

        <Card title={T.public}>
          <Toggle title={T.public} desc={scorecardPublic ? T.spOn : T.spOff}
            on={scorecardPublic} onChange={setSP} primary/>
          {scorecardPublic && (
            <div style={{ marginTop:14, padding:'10px 12px', background:'var(--aw-cyan-50)',
              borderLeft:'3px solid var(--aw-cyan)', borderRadius:8, fontSize:12.5,
              color:'var(--aw-cyan-700)', display:'flex', alignItems:'center', gap:8 }}>
              <Ic2 name="share" size={14}/>
              <code style={{ fontFamily:'IBM Plex Mono', fontSize:12 }}>
                aquawise.co.th/h/fasai
              </code>
              <Btn ghost style={{ marginLeft:'auto', padding:'4px 10px', fontSize:11 }}>
                {lang==='th'?'คัดลอก':'Copy'}
              </Btn>
            </div>
          )}
        </Card>

        <Card title={T.data}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ flex:1, fontSize:13.5, color:'var(--aw-ink-700)' }}>
              {T.export}
              <div style={{ fontSize:11.5, color:'var(--aw-ink-500)', marginTop:2,
                fontFamily:'IBM Plex Mono' }}>
                {lang==='th'?'ลูกค้า · รอบเลี้ยง · ล็อต · ตั้งแต่เริ่มใช้':'Customers · cycles · batches · all-time'}
              </div>
            </div>
            <Btn icon="upload">{T.download}</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Toggle({ title, desc, on, onChange, primary }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12,
      padding:'10px 0', borderBottom:'1px solid var(--aw-line)' }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13.5, fontWeight:600,
          color:primary?'var(--aw-blue)':'var(--aw-ink-900)' }}>{title}</div>
        <div style={{ fontSize:12, color:'var(--aw-ink-500)', marginTop:2 }}>{desc}</div>
      </div>
      <button onClick={() => onChange && onChange(!on)} style={{
        width:38, height:22, borderRadius:11, border:0, cursor: onChange?'pointer':'default',
        background: on?'var(--aw-cyan)':'var(--aw-line-strong)',
        position:'relative', padding:0, transition:'background 0.2s',
      }}>
        <div style={{
          position:'absolute', top:2, left: on?18:2,
          width:18, height:18, borderRadius:9, background:'#fff',
          transition:'left 0.2s', boxShadow:'0 1px 2px rgba(0,0,0,0.15)',
        }}/>
      </button>
    </div>
  );
}

// ─── Hatchery Onboarding Wizard ───────────────
function OnboardingWizard({ lang }) {
  const T = lang==='th' ? {
    title:'ยินดีต้อนรับสู่ AquaWise', sub:'ใช้เวลาประมาณ 30 นาทีจนถึงล็อตแรก',
    s1:'ข้อมูลแฮทเชอรี่', s2:'ดาวน์โหลดโปสเตอร์ QR',
    s3:'เพิ่มพนักงานหน้าเคาน์เตอร์', s4:'ทดสอบลงล็อตแรก',
    next:'ถัดไป', back:'ย้อนกลับ', skip:'ข้าม',
    s2desc:'พิมพ์ A4 แล้วติดที่หน้าเคาน์เตอร์ขาย — ลูกค้าทุกคนสแกน',
    s3desc:'ส่งลิงก์ LINE ให้พนักงาน เปิด LIFF แล้วลงล็อตได้ทันที',
    invite:'ส่งลิงก์เชิญใน LINE', dl:'ดาวน์โหลดโปสเตอร์',
  } : {
    title:'Welcome to AquaWise', sub:'~30 min from here to your first batch',
    s1:'Hatchery profile', s2:'Download QR poster',
    s3:'Add counter staff', s4:'First test batch',
    next:'Next', back:'Back', skip:'Skip',
    s2desc:'Print on A4 and place at the counter — every customer scans.',
    s3desc:'Send a LINE invite — staff open LIFF and start logging.',
    invite:'Send LINE invite', dl:'Download poster',
  };
  const steps = [T.s1, T.s2, T.s3, T.s4];
  const [step, setStep] = useS2(1);

  return (
    <div style={{ padding:'40px 32px 60px', maxWidth:760, margin:'0 auto',
      fontFamily: lang==='th'?'Noto Sans Thai':'Inter' }}>
      {/* Stepper */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:32 }}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{
              display:'flex', alignItems:'center', gap:8,
              color: step > i ? 'var(--aw-cyan)' : step === i+1 ? 'var(--aw-blue)' : 'var(--aw-ink-400)',
            }}>
              <div style={{
                width:26, height:26, borderRadius:13, fontSize:12, fontWeight:700,
                fontFamily:'IBM Plex Mono',
                display:'flex', alignItems:'center', justifyContent:'center',
                background: step > i ? 'var(--aw-cyan)' : step === i+1 ? 'var(--aw-blue)' : 'var(--aw-paper-2)',
                color: step >= i+1 ? '#fff' : 'var(--aw-ink-500)',
              }}>{step > i ? '✓' : i+1}</div>
              <span style={{ fontSize:13, fontWeight:600 }}>{s}</span>
            </div>
            {i < steps.length-1 && <div style={{ flex:1, height:1,
              background:'var(--aw-line)' }}/>}
          </React.Fragment>
        ))}
      </div>

      <div style={{ background:'var(--aw-card)', borderRadius:14,
        border:'1px solid var(--aw-line)', padding:32, marginBottom:18 }}>
        <h1 style={{ margin:0, fontFamily:'Plus Jakarta Sans', fontSize:24,
          fontWeight:700, letterSpacing:-0.5 }}>
          {step === 1 ? T.title : steps[step-1]}
        </h1>
        <p style={{ margin:'6px 0 24px', fontSize:14, color:'var(--aw-ink-500)' }}>
          {step === 1 ? T.sub : step === 2 ? T.s2desc : step === 3 ? T.s3desc :
            (lang==='th'?'ลงข้อมูลล็อตแรกของคุณ — ทีม AquaWise จะอยู่กับคุณตลอด':'Log your first batch — AquaWise team is with you')}
        </p>

        {step === 1 && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <Inp lbl={lang==='th'?'ชื่อแฮทเชอรี่':'Hatchery name'} value="ฟ้าใส แฮทเชอรี่"/>
            <Inp lbl={lang==='th'?'จังหวัด':'Province'} value="สมุทรสาคร"/>
            <Inp lbl={lang==='th'?'กำลังการผลิต':'Capacity'} value="120M PL/yr" mono/>
            <Inp lbl={lang==='th'?'พ่อแม่พันธุ์ที่ใช้':'Broodstock'} value="CP-Genetics, SyAqua"/>
          </div>
        )}
        {step === 2 && (
          <div style={{ display:'flex', gap:24, alignItems:'center',
            padding:'18px', background:'var(--aw-paper)', borderRadius:12 }}>
            <div style={{ flex:'0 0 140px', height:180,
              background:'#fff', border:'1px solid var(--aw-line-strong)',
              borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'IBM Plex Mono', fontSize:11, color:'var(--aw-ink-400)',
              flexDirection:'column', gap:8,
            }}>
              <div style={{ width:80, height:80,
                background:'repeating-conic-gradient(#1A1A17 0% 25%, #fff 0% 50%) 50%/12px 12px',
                borderRadius:4 }}/>
              <div>QR poster preview</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13.5, lineHeight:1.55, marginBottom:14 }}>
                {lang==='th'?'โปสเตอร์ของคุณพร้อมแล้ว — ใส่ชื่อ "ฟ้าใส แฮทเชอรี่" บนโปสเตอร์ A4 พร้อมพิมพ์':'Your poster is ready — A4 printable with "Fasai Hatchery" branded.'}
              </div>
              <Btn primary icon="upload">{T.dl}</Btn>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <Inp lbl={lang==='th'?'ชื่อพนักงาน':'Staff name'} value="ปุ๊ก หน้าเคาน์เตอร์"/>
            <div style={{ marginTop:14 }}>
              <Btn primary icon="line">{T.invite}</Btn>
            </div>
          </div>
        )}
        {step === 4 && (
          <div style={{ padding:'18px', background:'var(--aw-blue-50)',
            borderRadius:12, fontSize:13.5, color:'var(--aw-blue)', lineHeight:1.6 }}>
            {lang==='th'?'ทีม AquaWise จะนัดคุณวันที่ 28 เม.ย. เพื่อทดสอบลงล็อตแรกร่วมกัน':'AquaWise team has booked Apr 28 to walk through your first batch together.'}
          </div>
        )}
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <Btn ghost onClick={() => setStep(Math.max(1, step-1))}>{T.back}</Btn>
        <div style={{ flex:1 }}/>
        <Btn ghost>{T.skip}</Btn>
        <Btn primary onClick={() => setStep(Math.min(4, step+1))}>{T.next}</Btn>
      </div>
    </div>
  );
}

Object.assign(window, {
  CustomerDetail, BatchRegister, BatchDetail, RestockPredictor,
  PublicScorecard, DiseaseAlert, Settings, OnboardingWizard,
});
