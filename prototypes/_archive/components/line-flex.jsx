/* global React */
// LINE Flex Messages — F2, F3, F6, F7 + LIFF H1 + Poster F1

const { useState: useStateLine } = React;

// ─── LINE chat shell ─────────────────────────────
function LineShell({ children, time = '8:02', dateLabel = 'วันนี้' }) {
  return (
    <div style={{
      background: '#8FA9B8', minHeight: '100%', padding: '14px 0 20px',
      fontFamily: "'Noto Sans Thai','Inter',system-ui,sans-serif",
    }}>
      <div style={{
        textAlign: 'center', color: 'rgba(255,255,255,0.95)',
        fontSize: 12, padding: '4px 0 12px', fontWeight: 500,
        letterSpacing: 0.2,
      }}>
        {dateLabel} {time}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function BotAvatar() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 18, flexShrink: 0,
      background: 'linear-gradient(135deg,#008B8B 0%,#004AAD 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
    }}>
      <window.AW_LOGO size={22}/>
    </div>
  );
}

// Bot bubble container — incoming, with avatar
function BotMsg({ children, label, showAvatar = true, padding = true }) {
  return (
    <div style={{ padding: '0 12px' }}>
      {label && (
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.85)',
          paddingLeft: 56, marginBottom: 4, fontWeight: 500 }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ width: 36 }}>{showAvatar && <BotAvatar/>}</div>
        <div style={{
          maxWidth: 268, borderRadius: 16,
          background: padding ? '#fff' : 'transparent',
          padding: padding ? '11px 14px' : 0,
          fontSize: 14.5, lineHeight: 1.45, color: '#1A1A17',
          boxShadow: '0 1px 1px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Outgoing user bubble
function UserMsg({ children }) {
  return (
    <div style={{ padding: '0 12px', display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        maxWidth: 240, borderRadius: 16, background: '#85D86B',
        padding: '10px 14px', fontSize: 14.5, color: '#1A1A17', lineHeight: 1.4,
      }}>{children}</div>
    </div>
  );
}

// ─── F2: Welcome bot conversation ─────────────────
function FlexF2_Welcome() {
  return (
    <LineShell time="14:23">
      <BotMsg>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>สวัสดีครับ คุณพี่ 🙏</div>
        <div>เราคือ <b>AquaWise</b> ครับ —<br/>
          เป็นเพื่อนคู่คิดของพี่ตลอดรอบเลี้ยง<br/>
          คอยส่งราคาตลาดทุกเช้า และช่วยดูว่าฟาร์มเป็นยังไงบ้าง</div>
      </BotMsg>
      <BotMsg showAvatar={false}>
        ก่อนอื่น ขอชื่อพี่หน่อยได้มั้ยครับ?
      </BotMsg>
      <UserMsg>สมชาย ใจดี</UserMsg>
      <BotMsg>
        ยินดีที่ได้รู้จักครับพี่สมชาย 🤝<br/>
        แล้วฟาร์มของพี่ชื่ออะไรครับ?
      </BotMsg>
      <UserMsg>ฟาร์มกุ้งบ้านสวน</UserMsg>
      <BotMsg padding={false}>
        <div style={{ padding: '12px 14px 10px', background: '#fff' }}>
          <div style={{ fontSize: 11.5, color: '#6B6B63', fontFamily: 'IBM Plex Mono',
            letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>
            ยืนยันการลงทะเบียน
          </div>
          <div style={{ fontSize: 14, marginBottom: 10, lineHeight: 1.5 }}>
            เห็นว่าพี่เพิ่งซื้อ PL จาก<br/>
            <b>ฟ้าใส แฮทเชอรี่</b> วันนี้<br/>
            จำนวน <b className="mono">300,000</b> ตัว ใช่มั้ยครับ?
          </div>
        </div>
        <div style={{ display: 'flex', borderTop: '1px solid #EFEDE6' }}>
          <button style={{
            flex: 1, padding: '12px', border: 0, background: '#fff',
            color: '#004AAD', fontWeight: 600, fontSize: 14,
            fontFamily: 'inherit', cursor: 'pointer',
            borderRight: '1px solid #EFEDE6',
          }}>ใช่ครับ</button>
          <button style={{
            flex: 1, padding: '12px', border: 0, background: '#fff',
            color: '#6B6B63', fontWeight: 500, fontSize: 14,
            fontFamily: 'inherit', cursor: 'pointer',
          }}>ไม่ใช่</button>
        </div>
      </BotMsg>
    </LineShell>
  );
}

// ─── F3: Daily price card ──────────────────────────
function FlexF3_Price({ variant = 'a' }) {
  const { PRICES } = window.AW_DATA;
  return (
    <LineShell time="8:02">
      <BotMsg padding={false}>
        <div style={{ background: '#fff', overflow: 'hidden', minWidth: 280 }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px 12px',
            background: variant === 'b'
              ? 'linear-gradient(135deg,#004AAD 0%,#003A8A 100%)'
              : '#FAF8F4',
            color: variant === 'b' ? '#fff' : '#1A1A17',
            borderBottom: variant === 'a' ? '1px solid #E6E2D8' : 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontFamily: 'IBM Plex Mono',
              opacity: variant === 'b' ? 0.85 : 0.7,
              textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
              ราคาหน้าฟาร์ม · {PRICES.date}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700,
              fontFamily: 'Plus Jakarta Sans, Noto Sans Thai' }}>
              ราคากุ้งวันนี้
            </div>
          </div>
          {/* Rows */}
          <div style={{ padding: '4px 0' }}>
            {PRICES.rows.map((r, i) => (
              <div key={r.size} style={{
                display: 'grid', gridTemplateColumns: '54px 1fr 80px 70px',
                alignItems: 'center', padding: '10px 16px',
                borderTop: i > 0 ? '1px solid #F3EFE7' : 0,
              }}>
                <div style={{
                  fontFamily: 'IBM Plex Mono', fontSize: 12, fontWeight: 600,
                  color: '#6B6B63',
                }}>ไซส์ {r.size}</div>
                <div/>
                <div style={{
                  fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 17,
                  fontVariantNumeric: 'tabular-nums', color: '#1A1A17',
                }}>
                  {r.price}
                  <span style={{ fontSize: 10, color: '#8E8E84',
                    fontWeight: 500, marginLeft: 3 }}>฿/กก.</span>
                </div>
                <div style={{
                  fontFamily: 'IBM Plex Mono', fontSize: 12, textAlign: 'right',
                  color: r.delta > 0 ? '#2F7A4F' : r.delta < 0 ? '#B5371E' : '#8E8E84',
                  fontWeight: 500,
                }}>
                  {r.delta > 0 ? '▲' : r.delta < 0 ? '▼' : '—'} {r.delta !== 0 && Math.abs(r.delta)}
                </div>
              </div>
            ))}
          </div>
          {/* Context note */}
          <div style={{
            padding: '10px 16px', background: '#F3EFE7',
            fontSize: 11.5, color: '#6B6B63', lineHeight: 1.5,
          }}>
            <div>เทียบเฉลี่ย 3 ปีย้อนหลัง — ไซส์ 40 สูงกว่าค่าเฉลี่ย <b style={{ color: '#2F7A4F' }}>+16฿</b>, ไซส์ 80 ต่ำกว่า <b style={{ color: '#B5371E' }}>−7฿</b></div>
          </div>
          {/* Source + CTA */}
          <div style={{
            padding: '10px 16px', display: 'flex', alignItems: 'center',
            borderTop: '1px solid #E6E2D8', fontSize: 10.5,
            color: '#8E8E84', fontFamily: 'IBM Plex Mono',
          }}>
            ที่มา: {PRICES.source}
          </div>
          <button style={{
            width: '100%', padding: '13px', border: 0, borderTop: '1px solid #E6E2D8',
            background: '#fff', color: '#004AAD', fontWeight: 600, fontSize: 14,
            fontFamily: 'inherit', cursor: 'pointer',
          }}>📤 แชร์ราคาให้เพื่อนบ้าน</button>
        </div>
      </BotMsg>
    </LineShell>
  );
}

// ─── F6/F7: Day-30/Day-60 prompt ──────────────────
function FlexF6_Day30({ day = 30 }) {
  const T = day === 30 ? {
    head: 'ครบ 30 วันแล้วครับ 🦐',
    body: 'ลองประมาณดูคร่าว ๆ ครับ — กุ้งที่บ่อรอดประมาณกี่ % ครับ?',
    label: 'รายงานรอบเลี้ยง · Day 30',
  } : {
    head: 'ครบ 60 วันแล้วครับ',
    body: 'ตอนนี้กุ้งที่บ่อรอดประมาณกี่ % ครับ? และไซส์เฉลี่ยประมาณเท่าไหร่?',
    label: 'รายงานรอบเลี้ยง · Day 60',
  };
  const chips = ['50%', '60%', '70%', '80%', '90%', '100%', 'ไม่แน่ใจ'];
  return (
    <LineShell time="9:14">
      <BotMsg padding={false}>
        <div style={{ background: '#fff', minWidth: 280 }}>
          <div style={{ padding: '14px 16px 6px' }}>
            <div style={{
              fontSize: 11, fontFamily: 'IBM Plex Mono',
              color: '#008B8B', letterSpacing: 0.6, marginBottom: 6,
              textTransform: 'uppercase', fontWeight: 500,
            }}>{T.label}</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6,
              fontFamily: 'Plus Jakarta Sans, Noto Sans Thai' }}>{T.head}</div>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: '#3A3A35' }}>
              {T.body}
            </div>
          </div>
          {/* Horizontal scroll chips */}
          <div style={{
            display: 'flex', gap: 8, padding: '12px 16px 14px',
            overflowX: 'auto',
          }}>
            {chips.map((c, i) => (
              <button key={c} style={{
                flexShrink: 0, padding: '9px 16px', borderRadius: 999,
                border: c === 'ไม่แน่ใจ' ? '1px solid #D2CDC1' : '1px solid #004AAD',
                background: c === 'ไม่แน่ใจ' ? '#fff' :
                  i === 3 ? '#004AAD' : '#fff',
                color: i === 3 && c !== 'ไม่แน่ใจ' ? '#fff' :
                  c === 'ไม่แน่ใจ' ? '#6B6B63' : '#004AAD',
                fontWeight: 600, fontSize: 14, fontFamily: 'inherit',
                cursor: 'pointer', minWidth: c === 'ไม่แน่ใจ' ? 'auto' : 56,
              }}>{c}</button>
            ))}
          </div>
        </div>
      </BotMsg>
    </LineShell>
  );
}

// Day-30 follow-up acknowledgment (after farmer reports)
function FlexF6_Ack() {
  return (
    <LineShell time="9:16">
      <UserMsg>80%</UserMsg>
      <BotMsg padding={false}>
        <div style={{ background: '#fff', minWidth: 280 }}>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>
              ขอบคุณครับ บันทึกแล้ว 🙏
            </div>
            <div style={{
              padding: '12px 14px', background: '#E5F4F4', borderRadius: 10,
              borderLeft: '3px solid #008B8B', fontSize: 13.5, lineHeight: 1.55,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                ฟาร์มในแถวสมุทรสาครเฉลี่ย <span className="mono">76%</span>
              </div>
              <div style={{ color: '#3A3A35' }}>
                พี่อยู่ในกลุ่ม <b style={{ color: '#2F7A4F' }}>ดี</b> ครับ —
                สูงกว่าค่าเฉลี่ย 4 จุด
              </div>
              <div style={{ fontSize: 10.5, color: '#6B6B63',
                fontFamily: 'IBM Plex Mono', marginTop: 8 }}>
                อ้างอิง: 23 ฟาร์มในรัศมี 30 กม. · 30 วันที่ผ่านมา
              </div>
            </div>
          </div>
        </div>
      </BotMsg>
    </LineShell>
  );
}

// ─── F1: QR Poster ─────────────────────────────────
function PosterF1() {
  return (
    <div style={{
      width: 595, height: 842, // A4 @ 72dpi-ish
      background: '#FAF8F4', padding: 48, position: 'relative',
      fontFamily: "'Noto Sans Thai','Inter',sans-serif",
      display: 'flex', flexDirection: 'column',
      border: '1px solid var(--aw-line)',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12,
        paddingBottom: 18, borderBottom: '1px solid #E6E2D8' }}>
        <window.AW_LOGO size={40}/>
        <div>
          <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700,
            fontSize: 22, letterSpacing: -0.4 }}>AquaWise</div>
          <div style={{ fontSize: 12, color: '#6B6B63', fontFamily: 'IBM Plex Mono',
            letterSpacing: 0.4 }}>เพื่อนคู่คิดเกษตรกรกุ้งไทย</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 10.5, fontFamily: 'IBM Plex Mono',
            color: '#8E8E84' }}>ฟ้าใส แฮทเชอรี่ · สมุทรสาคร</div>
        </div>
      </div>

      {/* Promise */}
      <div style={{ marginTop: 36, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#008B8B', fontFamily: 'IBM Plex Mono',
          letterSpacing: 1, fontWeight: 600, textTransform: 'uppercase', marginBottom: 10 }}>
          ฟรี · สำหรับลูกค้าใหม่ทุกคน
        </div>
        <h1 style={{ margin: 0, fontFamily: 'Plus Jakarta Sans, Noto Sans Thai',
          fontSize: 44, lineHeight: 1.15, fontWeight: 800,
          letterSpacing: -1, color: '#1A1A17' }}>
          รับรายงานกุ้งของคุณ<br/>
          <span style={{ color: '#004AAD' }}>วันที่ 30 และ 60</span>
        </h1>
        <p style={{ margin: '14px 0 0', fontSize: 16, color: '#3A3A35',
          lineHeight: 1.5, maxWidth: 440 }}>
          พร้อมราคากุ้งหน้าฟาร์มรายวัน ตรงเข้า LINE ของคุณ —
          ไม่ต้องโหลดแอป ไม่ต้องสมัคร แค่สแกน
        </p>
      </div>

      {/* QR + steps */}
      <div style={{ display: 'flex', gap: 36, marginTop: 28,
        background: '#fff', padding: 28, borderRadius: 16,
        border: '1px solid #E6E2D8' }}>
        {/* QR */}
        <div style={{
          width: 200, height: 200, padding: 12, background: '#fff',
          borderRadius: 12, border: '2px solid #1A1A17',
          display: 'grid', gridTemplateColumns: 'repeat(21, 1fr)',
          gridTemplateRows: 'repeat(21, 1fr)', gap: 0,
        }}>
          {/* Procedural QR-ish pattern */}
          {Array.from({ length: 441 }).map((_, i) => {
            const x = i % 21, y = Math.floor(i / 21);
            const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
            const finderInner = (x >= 1 && x <= 5 && y >= 1 && y <= 5)
              || (x >= 15 && x <= 19 && y >= 1 && y <= 5)
              || (x >= 1 && x <= 5 && y >= 15 && y <= 19);
            const finderCore = (x >= 2 && x <= 4 && y >= 2 && y <= 4)
              || (x >= 16 && x <= 18 && y >= 2 && y <= 4)
              || (x >= 2 && x <= 4 && y >= 16 && y <= 18);
            let on = false;
            if (finder && !finderInner) on = true;
            else if (finderCore) on = true;
            else if (!finder) on = ((x * 31 + y * 17 + x * y) % 7) < 3;
            return <div key={i} style={{ background: on ? '#1A1A17' : '#fff' }}/>;
          })}
        </div>
        {/* Steps */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', gap: 14 }}>
          {[
            ['1', 'เปิดแอป LINE แล้วสแกน QR นี้'],
            ['2', 'กด "เพิ่มเพื่อน" AquaWise'],
            ['3', 'ตอบชื่อกับฟาร์ม — เสร็จแล้ว'],
          ].map(([n, t]) => (
            <div key={n} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 18,
                background: '#004AAD', color: '#fff', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 17,
              }}>{n}</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#1A1A17' }}>{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bilingual one-liner */}
      <div style={{ marginTop: 24, padding: '14px 18px', background: '#E5F4F4',
        borderRadius: 10, fontSize: 13.5, lineHeight: 1.5, color: '#1A1A17' }}>
        <div style={{ fontFamily: 'Noto Sans Thai' }}>
          <b>สแกนตอนซื้อลูกพันธุ์</b> เพื่อรับรายงานกุ้งฟรีตลอดรอบเลี้ยง
        </div>
        <div style={{ fontFamily: 'Inter', fontSize: 12.5, color: '#3A3A35', marginTop: 2 }}>
          <b>Scan when buying PL</b> to receive free survival reports through harvest.
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 18,
        borderTop: '1px solid #E6E2D8', display: 'flex',
        fontSize: 10.5, color: '#8E8E84', fontFamily: 'IBM Plex Mono',
        letterSpacing: 0.3 }}>
        <span>aquawise.co.th · LINE @aquawise</span>
        <span style={{ marginLeft: 'auto' }}>v1 · TH/EN · เม.ย. 2026</span>
      </div>
    </div>
  );
}

// ─── H1: LIFF Counter Batch Entry ──────────────────
function LIFFH1_BatchEntry() {
  return (
    <div style={{
      width: '100%', height: '100%', background: '#FAF8F4',
      fontFamily: "'Noto Sans Thai','Inter',sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      {/* LIFF header — looks like LINE in-app */}
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
        background: '#fff', borderBottom: '1px solid #E6E2D8',
      }}>
        <button style={{ border: 0, background: 0, fontSize: 22, color: '#1A1A17',
          cursor: 'pointer' }}>×</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>เพิ่มล็อตและลูกค้า</div>
          <div style={{ fontSize: 11, color: '#8E8E84',
            fontFamily: 'IBM Plex Mono' }}>ฟ้าใส แฮทเชอรี่</div>
        </div>
        <div style={{ width: 22 }}/>
      </div>

      <div style={{ flex: 1, padding: '18px 16px', overflow: 'auto' }}>
        {/* Recent batches */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#6B6B63', fontFamily: 'IBM Plex Mono',
            letterSpacing: 0.6, textTransform: 'uppercase',
            fontWeight: 500, marginBottom: 8 }}>
            ล็อตล่าสุดวันนี้
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {['B-2604-A', 'B-2604-B'].map((b, i) => (
              <button key={b} style={{
                padding: '8px 14px', borderRadius: 10, flexShrink: 0,
                border: i === 0 ? '1.5px solid #004AAD' : '1px solid #D2CDC1',
                background: i === 0 ? '#EAF1FB' : '#fff',
                color: i === 0 ? '#004AAD' : '#3A3A35',
                fontFamily: 'IBM Plex Mono', fontWeight: 600, fontSize: 13,
                cursor: 'pointer',
              }}>{b}</button>
            ))}
            <button style={{
              padding: '8px 14px', borderRadius: 10, flexShrink: 0,
              border: '1px dashed #D2CDC1', background: '#fff',
              color: '#6B6B63', fontSize: 13, cursor: 'pointer',
            }}>+ ใหม่</button>
          </div>
        </div>

        {/* Customer */}
        <Field label="ลูกค้า · LINE">
          <div style={{
            padding: '12px 14px', borderRadius: 10, background: '#fff',
            border: '1px solid #D2CDC1', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 18,
              background: 'linear-gradient(135deg,#85D86B,#5BA84A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 600, fontSize: 14,
            }}>ส</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>สมชาย ใจดี</div>
              <div style={{ fontSize: 11.5, color: '#8E8E84',
                fontFamily: 'IBM Plex Mono' }}>
                ✓ สแกน QR เมื่อ 2 นาทีที่แล้ว
              </div>
            </div>
            <span style={{
              fontSize: 10, padding: '3px 7px', borderRadius: 999,
              background: '#E6F2EB', color: '#2F7A4F', fontWeight: 600,
              fontFamily: 'IBM Plex Mono', letterSpacing: 0.4,
            }}>AUTO</span>
          </div>
        </Field>

        {/* Batch ID */}
        <Field label="รหัสล็อต">
          <div style={{
            padding: '12px 14px', borderRadius: 10, background: '#fff',
            border: '1.5px solid #004AAD',
            fontFamily: 'IBM Plex Mono', fontSize: 17, fontWeight: 600,
            color: '#1A1A17', letterSpacing: 0.5,
          }}>B-2604-A<span style={{ display: 'inline-block', width: 1, height: 18,
            background: '#004AAD', verticalAlign: 'middle', marginLeft: 2,
            animation: 'aw-blink 1s infinite' }}/></div>
        </Field>

        {/* PL count */}
        <Field label="จำนวน PL">
          <div style={{
            padding: '12px 14px', borderRadius: 10, background: '#fff',
            border: '1px solid #D2CDC1',
            fontFamily: 'Plus Jakarta Sans', fontSize: 22, fontWeight: 700,
            color: '#1A1A17', letterSpacing: -0.5,
            display: 'flex', alignItems: 'baseline', gap: 6,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <span>300,000</span>
            <span style={{ fontSize: 13, color: '#8E8E84', fontWeight: 500,
              fontFamily: 'Inter' }}>ตัว</span>
          </div>
        </Field>

        {/* Pond ID */}
        <Field label="รหัสบ่อ" optional>
          <div style={{
            padding: '12px 14px', borderRadius: 10, background: '#fff',
            border: '1px solid #D2CDC1', fontSize: 15,
            color: '#8E8E84',
          }}>P-03</div>
        </Field>
      </div>

      {/* Submit */}
      <div style={{ padding: 16, background: '#fff',
        borderTop: '1px solid #E6E2D8' }}>
        <button style={{
          width: '100%', padding: '15px', border: 0, borderRadius: 12,
          background: '#004AAD', color: '#fff', fontSize: 16, fontWeight: 700,
          fontFamily: 'inherit', cursor: 'pointer',
          boxShadow: '0 1px 0 rgba(0,0,0,0.08)',
        }}>
          บันทึกและส่งใบรับรอง →
        </button>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11,
          color: '#8E8E84', fontFamily: 'IBM Plex Mono' }}>
          ลูกค้าจะได้รับใบรับรองใน LINE ทันที
        </div>
      </div>
      <style>{`@keyframes aw-blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}

function Field({ label, optional, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11.5, color: '#6B6B63', fontFamily: 'IBM Plex Mono',
        letterSpacing: 0.5, textTransform: 'uppercase',
        fontWeight: 500, marginBottom: 6,
      }}>
        {label}
        {optional && (
          <span style={{ fontSize: 9.5, padding: '1px 6px', borderRadius: 4,
            background: '#F3EFE7', color: '#8E8E84', textTransform: 'none',
            letterSpacing: 0 }}>ไม่บังคับ</span>
        )}
      </div>
      {children}
    </div>
  );
}

Object.assign(window, {
  FlexF2_Welcome, FlexF3_Price, FlexF6_Day30, FlexF6_Ack,
  PosterF1, LIFFH1_BatchEntry,
});
