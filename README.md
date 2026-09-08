# SalesRanger TOPSHOP

ระบบขาย/บริหารตัวแทนจำหน่ายสำหรับ Cash Van Sales และ Credit Sales — ดูภาพรวมสถาปัตยกรรมได้ที่
[docs/topshop_architecture.html](docs/topshop_architecture.html)

## โครงสร้างโปรเจกต์

```
backend/          Google Apps Script — JSON API ล้วนๆ (ไม่มีหน้าเว็บ) จัดการ Central + Tenant Sheets
                   deploy ด้วย clasp (มี .clasp.json ผูกกับโปรเจกต์จริงแล้ว) — ดู backend/README.md
frontend-admin/    Admin App (ตัวแทนจำหน่าย + บริษัทเจ้าของสินค้า) — ยังไม่สร้าง แผนขึ้น Vercel สัปดาห์ 2
frontend-mobile/   Mobile App พนักงานขาย (LINE LIFF) — ยังไม่สร้าง แผนขึ้น Vercel สัปดาห์ 3
                   มีของเดิม 2 ชุดเก็บไว้อ้างอิง ดู frontend-mobile/README.md
docs/              เอกสารแผน/สถาปัตยกรรม
```

## Branch

- `main` — โค้ดที่ผ่านการตรวจแล้ว
- `UAT` — ไว้ทดสอบก่อนขึ้นจริงกับตัวแทนนำร่อง

## Stack

Google Apps Script (backend) + Google Sheets (database, เฟส 1) + GitHub + Vercel (frontend ทั้ง 2 แอป)
— เตรียมโครงสร้างรองรับ Cloud Database เต็มรูปแบบไว้สำหรับเฟสถัดไป ยังไม่ใช้ตอนนี้
