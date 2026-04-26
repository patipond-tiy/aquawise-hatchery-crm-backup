/* global React */
// AquaWise — H2/H3 farmer Flex Messages
// F4 Certificate (Flex + PDF), F5 Cycle update, F8 Harvest reporting,
// F9 Cross-farm context

function LineShell2({ children, time = '8:02', dateLabel = 'วันนี้' }) {
  return (
    <div style={{
      background: '#8FA9B8', minHeight: '100%', padding: '14px 0 20px',
      fontFamily: "'Noto Sans Thai','Inter',system-ui,sans-serif",
    }}>
      <div style={{
        textAlign: 'center', color: 'rgba(255,255,255,0.95)',
        fontSize: 12, padding: '4px 0 12px', fontWeight: 500,
      }}>{dateLabel} {time}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function BotAvatar2() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 18, flexShrink: 0,
      background: 'linear-gradient(135deg,#008B8B 0%,#004AAD 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}><window.AW_LOGO size={22}/></div>
  );
}

function BotMsg2({ children, padding = true, showAvatar = true }) {
  return (
    <div style={{ padding: '0 12px' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ width: 36 }}>{showAvatar && <BotAvatar2/>}</div>
        <div style={{
          maxWidth: 280, borderRadius: 16,
          background: padding ? '#fff' : 'transparent',
          padding: padding ? '11px 14px' : 0,
          fontSize: 14.5, lineHeight: 1.45, color: '#1A1A17',
          boxShadow: '0 1px 1px rgba(0,0,0,0.04)', overflow: 'hidden',
        }}>{children}</div>
      </div>
    </div>
  );
}

function UserMsg2({ children }) {
  return (
    <div style={{ padding: '0 12px', display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        maxWidth: 240, borderRadius: 16, background: '#85D86B',
        padding: '10px 14px', fontSize: 14.5, color: '#1A1A17', lineHeight: 1.4,
      }}>{children}</div>
    </div>
  );
}

// ─── F4: Batch Certificate (Flex Message version) ───
function FlexF4_Certificate() {
  const pathogens = [
    { n: 'EHP', clean: true }, { n: 'WSSV', clean: true },
    { n: 'IHHNV', clean: true }, { n: 'AHPND', clean: true },
    { n: 'TPD', clean: true },
  ];
  return (
    <LineShell2 time="14:25">
      <BotMsg2>
        <div style={{ fontSize: 14, marginBottom: 2 }}>
          ขอบคุณที่เลือกซื้อจากฟ้าใส แฮทเชอรี่ครับ 🙏<br/>
          นี่คือใบรับรองล็อตของพี่ — เก็บไว้ใช้อ้างอิงได้ตลอดรอบเลี้ยงครับ
        </div>
      </BotMsg2>
      <BotMsg2 padding={false}>
        <div style={{ background: '#fff', minWidth: 296, position: 'relative' }}>
          {/* Top band */}
          <div style={{
            background: 'linear-gradient(135deg,#004AAD,#008B8B)',
            color: '#fff', padding: '14px 16px',
          }}>
            <div style={{
              fontSize: 10.5, fontFamily: 'IBM Plex Mono', letterSpacing: 1.2,
              textTransform: 'uppercase', opacity: 0.85, marginBottom: 4,
            }}>ใบรับรองล็อต · BATCH CERTIFICATE</div>
            <div style={{
              fontFamily: 'IBM Plex Mono', fontSize: 22, fontWeight: 600,
              letterSpacing: 1, marginBottom: 4,
            }}>B-2604-A</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              ฟ้าใส แฮทเชอรี่ · สมุทรสาคร
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 10, marginBottom: 12 }}>
              <Field4 label="วันที่ออกล็อต" value="22 เม.ย. 2026"/>
              <Field4 label="จำนวน PL" value="300,000" unit="ตัว"/>
              <Field4 label="พ่อแม่พันธุ์" value="CP-Genetics Line A" full/>
            </div>

            {/* PCR */}
            <div style={{
              padding: '10px 12px', background: '#FAF8F4', borderRadius: 10,
              borderLeft: '3px solid #2F7A4F',
            }}>
              <div style={{
                fontSize: 10.5, fontFamily: 'IBM Plex Mono',
                color: '#205A37', letterSpacing: 0.5, fontWeight: 600,
                textTransform: 'uppercase', marginBottom: 6,
              }}>ผลตรวจ PCR · ปลอดเชื้อทั้งหมด</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {pathogens.map(p => <window.PathogenBadge key={p.n} name={p.n} clean={p.clean}/>)}
              </div>
            </div>

            {/* Stamp + verifier */}
            <div style={{
              marginTop: 14, display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 0 4px', borderTop: '1px dashed #E6E2D8',
            }}>
              <window.AW_Stamp size={64} label="VERIFIED"/>
              <div style={{ flex: 1, fontSize: 11, lineHeight: 1.5, color: '#3A3A35' }}>
                <div style={{ fontWeight: 600, fontSize: 12 }}>ตรวจสอบโดย AquaWise</div>
                <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 10,
                  color: '#6B6B63', marginTop: 2 }}>
                  ID: AW-2604-A-300K · 26 เม.ย. 2026
                </div>
                <div style={{ fontSize: 11, marginTop: 4, color: '#6B6B63' }}>
                  ตรวจสอบได้ที่ aquawise.co.th/v
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button style={{
            width: '100%', padding: '13px', border: 0, borderTop: '1px solid #E6E2D8',
            background: '#fff', color: '#004AAD', fontWeight: 600, fontSize: 14,
            fontFamily: 'inherit', cursor: 'pointer',
          }}>📄 บันทึกใบรับรอง (PDF)</button>
        </div>
      </BotMsg2>
    </LineShell2>
  );
}

function Field4({ label, value, unit, full }) {
  return (
    <div style={{ gridColumn: full ? 'span 2' : 'auto' }}>
      <div style={{ fontSize: 10, color: '#8E8E84', fontFamily: 'IBM Plex Mono',
        letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1A1A17',
        fontVariantNumeric: 'tabular-nums' }}>
        {value}{unit && <span style={{ fontSize: 11, color: '#6B6B63',
          fontWeight: 500, marginLeft: 3 }}>{unit}</span>}
      </div>
    </div>
  );
}

// ─── F4 PDF version ──────────────────────────────
function CertificatePDF() {
  return (
    <div style={{
      width: 595, height: 842, background: '#FFFFFF', padding: 56,
      fontFamily: "'Noto Sans Thai','Inter',sans-serif",
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
      position: 'relative', border: '1px solid #E6E2D8',
    }}>
      {/* Watermark stamp */}
      <div style={{
        position: 'absolute', top: 280, right: 56, opacity: 0.06,
        transform: 'rotate(-12deg)',
      }}>
        <window.AW_Stamp size={300} label="VERIFIED"/>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14,
        paddingBottom: 18, borderBottom: '2px solid #1A1A17' }}>
        <window.AW_LOGO size={36}/>
        <div>
          <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700,
            fontSize: 18, letterSpacing: -0.3 }}>AquaWise</div>
          <div style={{ fontSize: 10.5, color: '#6B6B63',
            fontFamily: 'IBM Plex Mono', letterSpacing: 0.5 }}>
            INDEPENDENT BATCH VERIFICATION
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right',
          fontFamily: 'IBM Plex Mono', fontSize: 10.5, color: '#6B6B63' }}>
          <div>VERIFICATION ID</div>
          <div style={{ color: '#1A1A17', fontWeight: 600, fontSize: 12, marginTop: 2 }}>
            AW-2604-A-300K
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ marginTop: 32, marginBottom: 28 }}>
        <div style={{
          fontSize: 11, color: '#008B8B', fontFamily: 'IBM Plex Mono',
          letterSpacing: 1.2, fontWeight: 600, textTransform: 'uppercase',
        }}>BATCH CERTIFICATE · ใบรับรองล็อตลูกพันธุ์</div>
        <h1 style={{ margin: '8px 0 0', fontFamily: 'IBM Plex Mono',
          fontSize: 38, fontWeight: 600, letterSpacing: 1.5 }}>
          B-2604-A
        </h1>
      </div>

      {/* Two-column meta */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
        padding: '20px 0', borderTop: '1px solid #E6E2D8',
        borderBottom: '1px solid #E6E2D8',
      }}>
        <PDFField label="ออกโดย / Issuer" value="ฟ้าใส แฮทเชอรี่"
          sub="Fasai Hatchery · Samut Sakhon"/>
        <PDFField label="ผู้รับ / Recipient" value="สมชาย ใจดี"
          sub="ฟาร์มกุ้งบ้านสวน · สมุทรสาคร"/>
        <PDFField label="วันที่ออกล็อต / Pack date" value="22 เม.ย. 2026"
          sub="22 April 2026"/>
        <PDFField label="จำนวน PL / Count" value="300,000 ตัว"
          sub="post-larvae"/>
        <PDFField label="พ่อแม่พันธุ์ / Broodstock line"
          value="CP-Genetics Line A" sub="SPF · gen. 8"/>
        <PDFField label="ระยะ / Stage" value="PL-12"
          sub="post-larva day 12"/>
      </div>

      {/* PCR table */}
      <div style={{ marginTop: 28 }}>
        <div style={{
          fontSize: 11, fontFamily: 'IBM Plex Mono', letterSpacing: 0.6,
          textTransform: 'uppercase', color: '#6B6B63', fontWeight: 600, marginBottom: 8,
        }}>ผลตรวจ PCR · PCR pathogen screening</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A17' }}>
              {['Pathogen', 'Method', 'Lab', 'Result'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 10px',
                  fontFamily: 'IBM Plex Mono', fontSize: 10.5, fontWeight: 600,
                  letterSpacing: 0.4, color: '#3A3A35' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['EHP', 'qPCR', 'BIOTEC NSTDA', 'Negative'],
              ['WSSV', 'PCR', 'BIOTEC NSTDA', 'Negative'],
              ['IHHNV', 'PCR', 'BIOTEC NSTDA', 'Negative'],
              ['AHPND/EMS', 'PCR', 'BIOTEC NSTDA', 'Negative'],
              ['TPD (Vp-Tox)', 'qPCR', 'In-house', 'Negative'],
            ].map(([p, m, l, r], i) => (
              <tr key={p} style={{ borderBottom: '1px solid #F3EFE7' }}>
                <td style={{ padding: '9px 10px', fontWeight: 600 }}>{p}</td>
                <td style={{ padding: '9px 10px', color: '#6B6B63',
                  fontFamily: 'IBM Plex Mono', fontSize: 11 }}>{m}</td>
                <td style={{ padding: '9px 10px', color: '#6B6B63', fontSize: 11 }}>{l}</td>
                <td style={{ padding: '9px 10px' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                    background: '#E6F2EB', color: '#205A37', fontSize: 11,
                    fontWeight: 600, fontFamily: 'IBM Plex Mono',
                  }}>{r}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signature row */}
      <div style={{ marginTop: 'auto', paddingTop: 24, display: 'flex',
        alignItems: 'flex-end', gap: 24 }}>
        <window.AW_Stamp size={92}/>
        <div style={{ flex: 1, borderTop: '1px solid #1A1A17', paddingTop: 8 }}>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 10,
            color: '#6B6B63', letterSpacing: 0.4 }}>VERIFIED BY</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
            AquaWise Verification System
          </div>
          <div style={{ fontSize: 11, color: '#6B6B63', marginTop: 2 }}>
            Issued 26 April 2026 · Verify at aquawise.co.th/v/AW-2604-A-300K
          </div>
        </div>
      </div>
    </div>
  );
}

function PDFField({ label, value, sub }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontFamily: 'IBM Plex Mono',
        color: '#6B6B63', letterSpacing: 0.4, textTransform: 'uppercase',
        marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A17' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#8E8E84', marginTop: 1 }}>{sub}</div>
    </div>
  );
}

// ─── F5: Weekly cycle update ─────────────────────
function FlexF5_CycleUpdate() {
  return (
    <LineShell2 time="7:30">
      <BotMsg2 padding={false}>
        <div style={{ background: '#fff', minWidth: 280 }}>
          <div style={{ padding: '14px 16px 12px',
            background: '#F3EFE7', borderBottom: '1px solid #E6E2D8' }}>
            <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono',
              letterSpacing: 0.5, color: '#6B6B63', textTransform: 'uppercase',
              fontWeight: 500, marginBottom: 4 }}>
              อัพเดทรอบเลี้ยง · บ่อ P-03
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans Thai',
                  fontSize: 28, fontWeight: 700, letterSpacing: -0.5,
                  color: '#004AAD', lineHeight: 1 }}>Day 52</div>
                <div style={{ fontSize: 12, color: '#6B6B63', marginTop: 2 }}>
                  จากทั้งหมดประมาณ 110 วัน
                </div>
              </div>
              <div style={{ flex: 1 }}/>
              <window.CycleDot day={52} total={110}/>
            </div>
            {/* Progress bar */}
            <div style={{ marginTop: 12, height: 6, borderRadius: 3,
              background: '#E6E2D8', overflow: 'hidden' }}>
              <div style={{ width: '47%', height: '100%',
                background: 'linear-gradient(90deg,#004AAD,#008B8B)' }}/>
            </div>
          </div>

          <div style={{ padding: '14px 16px' }}>
            <Row5 label="ขนาดประมาณ" value="2.4 ก./ตัว" hint="ปกติช่วงนี้ 2.0–2.8 ก."/>
            <Row5 label="หมุดถัดไป" value="Day 60 — รายงานรอด" hint="อีก 8 วัน"/>
          </div>

          <div style={{
            padding: '12px 14px', margin: '0 16px 14px', background: '#FBF1DC',
            borderRadius: 10, borderLeft: '3px solid #B5790E', fontSize: 12.5,
            lineHeight: 1.5, color: '#3A3A35',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 2, color: '#8C5A0B' }}>
              ⚠ สภาพอากาศแถวสมุทรสาคร 3 วันถัดไป
            </div>
            ฝนตกบ่ายทั้ง 3 วัน — ระวัง pH ตก ให้ตรวจช่วงเช้าเพิ่มอีกรอบ
          </div>

          <button style={{
            width: '100%', padding: '12px', border: 0, borderTop: '1px solid #E6E2D8',
            background: '#fff', color: '#004AAD', fontWeight: 600, fontSize: 14,
            fontFamily: 'inherit', cursor: 'pointer',
          }}>บันทึกขนาดวันนี้</button>
        </div>
      </BotMsg2>
    </LineShell2>
  );
}

function Row5({ label, value, hint }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid #F3EFE7',
      display: 'flex', alignItems: 'center' }}>
      <div style={{ fontSize: 12, color: '#6B6B63', flex: 1 }}>{label}</div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
        {hint && <div style={{ fontSize: 11, color: '#8E8E84',
          fontFamily: 'IBM Plex Mono' }}>{hint}</div>}
      </div>
    </div>
  );
}

// ─── F8: Harvest reporting (multi-step) ─────────
function FlexF8_Harvest() {
  return (
    <LineShell2 time="6:48">
      <BotMsg2>
        <div style={{ marginBottom: 4 }}>เห็นว่าครบ 110 วันแล้ว 🦐</div>
        <div>จับกุ้งแล้วใช่มั้ยครับ?</div>
      </BotMsg2>
      <div style={{ padding: '0 12px', display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
        {['จับแล้ว', 'ยังไม่จับ', 'พรุ่งนี้'].map((t, i) => (
          <button key={t} style={{
            padding: '8px 14px', borderRadius: 999,
            border: '1px solid ' + (i === 0 ? '#004AAD' : '#D2CDC1'),
            background: i === 0 ? '#004AAD' : '#fff',
            color: i === 0 ? '#fff' : '#3A3A35',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>
      <UserMsg2>จับแล้ว</UserMsg2>
      <BotMsg2>เยี่ยมเลย 🎉<br/>ได้กี่ตัน/กก. ครับ?</BotMsg2>
      <UserMsg2>3,200 กก.</UserMsg2>
      <BotMsg2>ขายไซส์อะไรครับ?</BotMsg2>
      <div style={{ padding: '0 12px', display: 'flex', gap: 6, justifyContent: 'flex-end',
        flexWrap: 'wrap' }}>
        {['40', '50', '60', '70', '80'].map((s, i) => (
          <button key={s} style={{
            padding: '8px 14px', borderRadius: 999,
            border: '1px solid ' + (i === 2 ? '#004AAD' : '#D2CDC1'),
            background: i === 2 ? '#004AAD' : '#fff',
            color: i === 2 ? '#fff' : '#3A3A35', minWidth: 48,
            fontSize: 14, fontWeight: 600, fontFamily: 'IBM Plex Mono',
            cursor: 'pointer',
          }}>{s}</button>
        ))}
      </div>
      <BotMsg2 padding={false}>
        <div style={{ background: '#fff', minWidth: 280 }}>
          <div style={{ padding: '14px 16px' }}>
            <div style={{
              fontSize: 11, fontFamily: 'IBM Plex Mono', letterSpacing: 0.5,
              color: '#008B8B', textTransform: 'uppercase', fontWeight: 600,
              marginBottom: 6,
            }}>สรุปการจับ · บ่อ P-03</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Sum8 label="น้ำหนักรวม" value="3,200" unit="กก."/>
              <Sum8 label="ไซส์เฉลี่ย" value="60"/>
              <Sum8 label="รอดประมาณ" value="80%" tone="good"/>
              <Sum8 label="ราคาขาย" value="188" unit="฿/กก."/>
            </div>
            <div style={{ marginTop: 14, padding: '10px 12px', background: '#E5F4F4',
              borderRadius: 10, fontSize: 12.5, lineHeight: 1.5, color: '#1A1A17' }}>
              <b>รายได้รวมประมาณ ฿601,600</b><br/>
              <span style={{ color: '#3A3A35' }}>
                สูงกว่ารอบที่แล้ว 8% — เริ่มรอบใหม่เมื่อพร้อม เราจะแจ้งเตือนล่วงหน้าครับ
              </span>
            </div>
          </div>
        </div>
      </BotMsg2>
    </LineShell2>
  );
}

function Sum8({ label, value, unit, tone }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: '#8E8E84', fontFamily: 'IBM Plex Mono',
        letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      <div style={{
        fontFamily: 'Plus Jakarta Sans', fontSize: 20, fontWeight: 700,
        color: tone === 'good' ? '#2F7A4F' : '#1A1A17', letterSpacing: -0.4,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}{unit && <span style={{ fontSize: 11, color: '#6B6B63',
          fontWeight: 500, marginLeft: 3, fontFamily: 'Inter' }}>{unit}</span>}
      </div>
    </div>
  );
}

// ─── F9: Cross-farm context (uncomfortable truth) ───
function FlexF9_CrossFarm() {
  return (
    <LineShell2 time="11:42">
      <UserMsg2>กุ้งผมรอดแค่ 38% ลูกพันธุ์น่าจะมีปัญหา</UserMsg2>
      <BotMsg2>
        เข้าใจครับ เป็นเรื่องน่าหงุดหงิดมาก<br/>
        ขอให้ดูข้อมูลของล็อตเดียวกันที่ฟาร์มอื่น —<br/>
        เพื่อให้พี่ตัดสินใจเองครับ
      </BotMsg2>
      <BotMsg2 padding={false}>
        <div style={{ background: '#fff', minWidth: 290 }}>
          <div style={{ padding: '14px 16px 6px',
            borderBottom: '1px solid #F3EFE7' }}>
            <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono',
              letterSpacing: 0.5, color: '#6B6B63', textTransform: 'uppercase',
              fontWeight: 500, marginBottom: 4 }}>
              ล็อตเดียวกัน · B-2604-A
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.5, color: '#3A3A35' }}>
              ลูกพันธุ์ล็อตนี้ขายให้ <b>6 ฟาร์ม</b><br/>
              ในเขตสมุทรสาครและฉะเชิงเทรา
            </div>
          </div>

          {/* Distribution */}
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12,
              marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10.5, fontFamily: 'IBM Plex Mono',
                  color: '#6B6B63', letterSpacing: 0.4 }}>เฉลี่ย D30 ของล็อต</div>
                <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 28,
                  fontWeight: 700, color: '#008B8B', letterSpacing: -0.5,
                  fontVariantNumeric: 'tabular-nums' }}>78%</div>
              </div>
              <div style={{ flex: 1 }}/>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10.5, fontFamily: 'IBM Plex Mono',
                  color: '#6B6B63', letterSpacing: 0.4 }}>ฟาร์มของพี่</div>
                <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 28,
                  fontWeight: 700, color: '#B5371E', letterSpacing: -0.5,
                  fontVariantNumeric: 'tabular-nums' }}>38%</div>
              </div>
            </div>

            {/* 6 farms strip */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4,
              height: 60, padding: '8px 0', borderTop: '1px dashed #E6E2D8',
              borderBottom: '1px dashed #E6E2D8', marginBottom: 12 }}>
              {[84, 81, 78, 76, 72, 38].map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%', height: `${v}%`, borderRadius: 3,
                    background: i === 5 ? '#B5371E' : '#008B8B',
                    opacity: i === 5 ? 1 : 0.45 + (i * 0.04),
                  }}/>
                  <div style={{ fontSize: 10, fontFamily: 'IBM Plex Mono',
                    color: i === 5 ? '#B5371E' : '#6B6B63',
                    fontWeight: i === 5 ? 600 : 400 }}>{v}%</div>
                </div>
              ))}
            </div>

            {/* Factor analysis */}
            <div style={{
              padding: '10px 12px', background: '#FAF8F4',
              borderRadius: 10, borderLeft: '3px solid #6B6B63',
              fontSize: 12.5, lineHeight: 1.5,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 6, color: '#1A1A17' }}>
                ปัจจัยที่ต่างกันระหว่างฟาร์มที่รอดสูง vs ฟาร์มของพี่
              </div>
              <DiffRow label="ค่า pH ผันผวน" mine="±0.6" theirs="±0.2"/>
              <DiffRow label="ความเค็ม" mine="22 ppt" theirs="15 ppt"/>
              <DiffRow label="ลึกบ่อเฉลี่ย" mine="0.9 ม." theirs="1.4 ม."/>
            </div>

            <div style={{ fontSize: 11, color: '#8E8E84',
              fontFamily: 'IBM Plex Mono', marginTop: 10, lineHeight: 1.5 }}>
              ข้อมูลจาก 5 ฟาร์ม (ไม่ระบุชื่อ) — รายงานผ่าน LINE OA
              ระหว่าง 25 มี.ค.–25 เม.ย. 2026 · เราไม่สรุปแทนพี่
            </div>
          </div>
        </div>
      </BotMsg2>
    </LineShell2>
  );
}

function DiffRow({ label, mine, theirs }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto',
      alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12 }}>
      <div style={{ color: '#3A3A35' }}>{label}</div>
      <div style={{ fontFamily: 'IBM Plex Mono', color: '#B5371E',
        fontWeight: 600, fontSize: 11.5 }}>{mine}</div>
      <div style={{ fontFamily: 'IBM Plex Mono', color: '#2F7A4F',
        fontWeight: 600, fontSize: 11.5, minWidth: 56, textAlign: 'right' }}>{theirs}</div>
    </div>
  );
}

Object.assign(window, {
  FlexF4_Certificate, CertificatePDF, FlexF5_CycleUpdate,
  FlexF8_Harvest, FlexF9_CrossFarm,
});
