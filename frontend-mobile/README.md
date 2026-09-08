# SalesRanger TOPSHOP — Frontend (Mobile / LINE LIFF)

ยังไม่ได้สร้างจริง — แผนคือ static site (HTML/CSS/JS ธรรมดา หรือเฟรมเวิร์คเบาๆ) deploy บน Vercel
ผ่าน GitHub เรียก backend (`../backend/`) ทั้งหมดผ่าน `fetch()` ตามสัญญา `doPost` ที่ระบุไว้ใน
`backend/README.md`

## `_legacy-standalone-liff-app/` — ตัวตั้งต้นที่แนะนำให้ต่อยอด

`index.html` ไฟล์เดียวจบ (LIFF SDK + Tailwind, ไม่มี framework) ที่มีอยู่แล้วใน repo นี้ก่อนหน้า
**มีของสำคัญที่เราไม่เคยออกแบบไว้เลย และควรเอามาต่อยอด ไม่ใช่เขียนใหม่หมด:**
- เรียก backend ด้วย `fetch(API_URL, {method:"POST", headers:{"Content-Type":"text/plain;..."}})`
  — ตรงกับสัญญา `doPost` ของ backend ใหม่เป๊ะ (เลี่ยง CORS preflight แบบเดียวกัน)
- **Offline queue**: เก็บบิลลง `localStorage` เวลาไม่มีสัญญาณ แล้ว sync ทีหลัง (`saveQueue`/`loadQueue`)
  — สำคัญมากสำหรับ cash van เขตห่างไกล ต้องยกแนวคิดนี้มาใช้ต่อ
- แคชข้อมูล bootstrap ไว้ใน `localStorage` ให้เปิดแอปได้แม้เน็ตช้า

สิ่งที่ต้องแก้ก่อนใช้จริง: `API_URL`/`LIFF_ID` ชี้ endpoint เก่า, ชื่อ action ต้องแมพกับ `ACTION_MAP`
ของ backend ใหม่ (`getBootstrap`/`recordSale`/...), หน้า login ต้องรับ `?code=` แล้วเรียก action
`lineExchangeCode` แทนที่ backend จะ redirect ให้เอง (ดูขั้นตอนใน `backend/README.md`), และ payload
ของ mobile action ทุกตัวต้องแนบ `lineUserId` มาด้วย (ดูตาราง action ใน `backend/README.md`)

## `_legacy-gas-liff-reference/` — อ้างอิงรอง

ไฟล์ HTML ชุดที่ backend เคยเสิร์ฟเองผ่าน HtmlService (ก่อนแยกโปรเจกต์ตามที่ตกลงกันภายหลัง) — เก็บไว้
อ้างอิง UI/UX บางส่วนเท่านั้น (การ์ดสินค้า, ตะกร้า, หน้าจอ stock/visit) ตัวโครงหลักแนะนำให้ใช้
`_legacy-standalone-liff-app/` เป็นฐานแทน เพราะมีรูปแบบเรียก backend ที่ตรงกับสถาปัตยกรรมใหม่อยู่แล้ว

กำหนดสร้างจริง: สัปดาห์ที่ 3 ตามแผน — ก่อนหน้านั้น Admin App (`frontend-admin/`) มาก่อนในสัปดาห์ที่ 2
