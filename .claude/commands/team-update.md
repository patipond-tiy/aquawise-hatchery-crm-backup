# Team Update Generator

Write a team work update summary based on what the user specifies.

## Instructions

1. **Determine the source** of updates. Ask the user (if not already specified via `$ARGUMENTS`):
   - "from last N commits" — run `git log --oneline -N` and `git diff HEAD~N..HEAD --stat` to understand what changed
   - "from this chat" — summarize what was accomplished in the current conversation
   - "from today" / "from yesterday" — run `git log --oneline --since="YYYY-MM-DD"` for the relevant date
   - The user may also just describe what they did manually

2. **Gather context.** Based on the source:
   - For git commits: read the commit messages AND diff stats to understand the actual work done, not just commit titles
   - For chat history: review what was discussed and accomplished in this session
   - For manual input: use what the user tells you

3. **Write the update** in this exact format:

```
DD/MM/YYYY

1. [สรุปงานข้อที่ 1 เป็นภาษาไทย — อธิบายสั้นๆ ว่าทำอะไร ทำไม]
2. [สรุปงานข้อที่ 2]
3. ...
```

**Format rules:**
- Date format: `DD/MM/YYYY` (Thai convention, Buddhist Era is NOT used — use CE)
- Language: Thai only
- Each item: 1-2 sentences, action-oriented — what was done and why/for what purpose
- Group related small changes into one item (e.g. don't list each file separately)
- Order: most important/impactful first
- No markdown formatting inside the items (no bold, no links, no code blocks)
- No bullet sub-items — each numbered item is self-contained

4. **Save to a temporary file:**
   - Write the update to `/tmp/team-update.txt`
   - Tell the user: "Update พร้อมแล้วที่ `/tmp/team-update.txt` — copy แล้วบอกได้เลย แล้วจะลบให้"

5. **Wait for confirmation.** When the user says they copied it (e.g. "copied", "copy แล้ว", "เรียบร้อย", "ok", "done"):
   - Delete `/tmp/team-update.txt`
   - Confirm: "ลบแล้วครับ"

## Handling $ARGUMENTS

If the user provides arguments, parse them:
- `/team-update last 3 commits` → source = last 3 git commits
- `/team-update from chat` → source = current chat session
- `/team-update today` → source = today's git commits
- `/team-update yesterday` → source = yesterday's git commits
- No arguments → ask the user what to summarize

## Example Output

```
04/02/2026

1. สร้างเอกสารสรุปดีลกับน้ำใสฟาร์มทั้งภาษาไทยและภาษาอังกฤษ เพื่อส่งต่อให้กับบอร์ดบริหารของน้ำใสฟาร์ม
2. สร้าง Proposal v5 ใหม่ทั้งหมด 8 เอกสาร — ปรับปรุงจาก feedback การประชุมวันที่ 3 ก.พ.
3. ปรับ Value Proposition ใหม่ — เปลี่ยนจาก "เพิ่มรายได้ 10M" เป็น "ลดความเสี่ยง + ประหยัดเวลา"
4. สร้างตัวเลือกราคา 4 แบบ — ตั้งแต่ 1M ถึง 2.86M พร้อมวิเคราะห์ cash flow
5. อัปเดต INDEX.md — เพิ่ม v5 เป็น CURRENT พร้อมรายละเอียดการเปลี่ยนแปลง
```
