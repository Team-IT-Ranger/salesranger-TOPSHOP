/**
 * ===================== DEV TOOLS (Apps Script Editor เท่านั้น) =====================
 * ห้ามลงทะเบียนใน ACTION_MAP / ADMIN_ACTION_MAP เด็ดขาด — รันจาก Editor โดยตรงเท่านั้น
 * (createFirstSuperAdmin สร้างบัญชีที่ bypass การเช็คสิทธิ์ทั้งหมด ถ้าเปิดผ่าน API จะอันตรายมาก)
 */

// รันครั้งเดียวหลัง setupCentralSheet() เพื่อสร้างแอดมินคนแรกเข้า Admin App ได้
// แก้ 3 ค่าด้านล่างก่อน Run
function createFirstSuperAdmin() {
  var username = 'admin';           // ← แก้ก่อน Run
  var password = 'ChangeMe123!';    // ← แก้ก่อน Run แล้วรีบเปลี่ยนหลัง login ครั้งแรก
  var displayName = 'System Admin'; // ← แก้ก่อน Run

  var existing = centralObjects('admin_users');
  if (existing.some(function(u) { return String(u.username).toLowerCase() === username.toLowerCase(); })) {
    Logger.log('มี username นี้อยู่แล้ว: ' + username);
    return;
  }

  var salt = Utilities.getUuid();
  centralAppend('admin_users', {
    record_id: centralNextId('admin_users'),
    username: username,
    password_hash: _hashPassword(password, salt),
    salt: salt,
    display_name: displayName,
    role_code: 'super_admin',
    tenant_id: '',
    status: 'active',
    created_at: nowStr()
  });
  Logger.log('✅ สร้าง super_admin สำเร็จ: ' + username + ' — เข้าสู่ระบบแล้วเปลี่ยนรหัสผ่านทันที');
}

// สร้างแอดมินระดับตัวแทน 1 คน — ผูกกับ tenant_id ที่ระบุ
function createTenantAdmin(tenantId, username, password, displayName) {
  var existing = centralObjects('admin_users');
  if (existing.some(function(u) { return String(u.username).toLowerCase() === String(username).toLowerCase(); })) {
    Logger.log('มี username นี้อยู่แล้ว: ' + username);
    return;
  }
  var salt = Utilities.getUuid();
  centralAppend('admin_users', {
    record_id: centralNextId('admin_users'),
    username: username,
    password_hash: _hashPassword(password, salt),
    salt: salt,
    display_name: displayName,
    role_code: 'tenant_admin',
    tenant_id: tenantId,
    status: 'active',
    created_at: nowStr()
  });
  Logger.log('✅ สร้าง tenant_admin สำเร็จ: ' + username + ' (tenant: ' + tenantId + ')');
}

// เรียกทดสอบว่าเชื่อม Central Sheet ได้ปกติหรือไม่
function testCentralConnection() {
  var sheet = centralSheet('liff_users');
  Logger.log('เชื่อมต่อ Central Sheet สำเร็จ: ' + sheet.getName());
}
