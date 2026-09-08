/**
 * ===================== MASTER DATA =====================
 * ลูกค้า (customers) เก็บที่ Central Sheet มี tenant_id กำกับว่าเป็นของตัวแทนไหน
 * สินค้า/กลุ่มสินค้า/กลุ่มร้านค้า บริษัทเจ้าของสินค้าคุมจากศูนย์กลาง ใช้ร่วมกันทุกตัวแทน
 */

// ── Mobile App: เพิ่มลูกค้าใหม่หน้างาน ──
function addCustomer(user, payload) {
  if (!payload.name) return { success: false, message: 'กรุณาระบุชื่อลูกค้า' };
  var custId = centralNextId('customers');
  centralAppend('customers', {
    record_id: custId, name: payload.name, tenant_id: user.tenantId, group_id: payload.groupId || 0,
    phone: payload.phone || '', tax_id: payload.taxId || '', address: payload.address || '',
    subdistrict_id: '', district_id: '', province_id: '',
    lat: payload.lat || '', lng: payload.lng || '', is_active: 'TRUE', created_at: nowStr()
  });
  cacheClear('bootstrap', user.lineUserId);
  return { success: true, customerId: custId };
}

// ── Admin App: ลูกค้า (ฝั่งตัวแทนจัดการของตัวเอง, บริษัทเห็นทั้งหมด) ──
function listCustomersAdmin(session) {
  var err = _requirePermission(session, 'customers', 'view'); if (err) return err;
  var rows = centralObjects('customers');
  if (session.tenant_id) rows = rows.filter(function(c) { return String(c.tenant_id) === String(session.tenant_id); });
  return { success: true, data: rows };
}

function addCustomerAdmin(session, payload) {
  var err = _requirePermission(session, 'customers', 'edit'); if (err) return err;
  var tenantId = session.tenant_id || payload.tenantId;
  if (!tenantId) return { success: false, message: 'กรุณาระบุตัวแทนจำหน่าย' };
  centralAppend('customers', {
    record_id: centralNextId('customers'), name: payload.name, tenant_id: tenantId, group_id: payload.groupId || 0,
    phone: payload.phone || '', tax_id: payload.taxId || '', address: payload.address || '',
    subdistrict_id: payload.subdistrictId || '', district_id: payload.districtId || '', province_id: payload.provinceId || '',
    lat: payload.lat || '', lng: payload.lng || '', is_active: 'TRUE', created_at: nowStr()
  });
  return { success: true };
}

function updateCustomerAdmin(session, payload) {
  var err = _requirePermission(session, 'customers', 'edit'); if (err) return err;
  centralUpdate('customers', payload.id, {
    name: payload.name, group_id: payload.groupId, phone: payload.phone, tax_id: payload.taxId,
    address: payload.address, lat: payload.lat, lng: payload.lng, is_active: payload.isActive
  });
  return { success: true };
}

// ── Admin App: พนักงานขาย (ตัวแทนอนุมัติ/ปิดการใช้งานพนักงานของตัวเอง) ──
function listStaffAdmin(session) {
  var err = _requirePermission(session, 'staff', 'view'); if (err) return err;
  var rows = centralObjects('liff_users');
  if (session.tenant_id) rows = rows.filter(function(u) { return String(u.tenant_id) === String(session.tenant_id); });
  return { success: true, data: rows.map(function(u) { return {
    lineUserId: u.line_user_id, displayName: u.display_name, role: u.role, tenantId: u.tenant_id,
    status: u.status, lastLogin: safeDateStr(u.last_login)
  }; }) };
}

// payload: { lineUserId, status('Yes'/'No'), role('van_sales'/'credit_sales') }
function updateStaffAdmin(session, payload) {
  var err = _requirePermission(session, 'staff', 'edit'); if (err) return err;
  var sh = centralSheet('liff_users');
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(payload.lineUserId)) {
      if (session.tenant_id && String(data[i][3]) !== String(session.tenant_id)) return { success: false, message: 'ไม่มีสิทธิ์แก้ไขพนักงานของตัวแทนอื่น' };
      if (payload.status) sh.getRange(i + 1, 5).setValue(payload.status);
      if (payload.role) sh.getRange(i + 1, 3).setValue(payload.role);
      return { success: true };
    }
  }
  return { success: false, message: 'ไม่พบผู้ใช้นี้' };
}

// ── Admin App: สินค้า (บริษัทเจ้าของสินค้าเท่านั้น) ──
function listProductsAdmin(session) {
  var err = _requirePermission(session, 'products', 'view'); if (err) return err;
  return { success: true, data: centralObjects('products') };
}

function addProduct(session, payload) {
  var err = _requirePermission(session, 'products', 'edit'); if (err) return err;
  centralAppend('products', {
    record_id: centralNextId('products'), name: payload.name, base_price: payload.basePrice || 0,
    unit: payload.unit || 'ชิ้น', group_id: payload.groupId || 0, is_active: 'TRUE'
  });
  return { success: true };
}

function updateProduct(session, payload) {
  var err = _requirePermission(session, 'products', 'edit'); if (err) return err;
  centralUpdate('products', payload.id, {
    name: payload.name, base_price: payload.basePrice, unit: payload.unit,
    group_id: payload.groupId, is_active: payload.isActive
  });
  return { success: true };
}

// ── Admin App: หน่วยขายเพิ่มเติมของสินค้า (เช่น แพ็ค/ลัง คนละราคา คนละ factor) ──
function listProductUnits(session, payload) {
  var err = _requirePermission(session, 'products', 'view'); if (err) return err;
  var rows = centralObjects('product_units');
  if (payload && payload.productId) rows = rows.filter(function(u) { return String(u.product_id) === String(payload.productId); });
  return { success: true, data: rows };
}

function addProductUnit(session, payload) {
  var err = _requirePermission(session, 'products', 'edit'); if (err) return err;
  if (!payload.productId || !payload.unitCode || !payload.unitFactor) return { success: false, message: 'กรุณาระบุสินค้า/รหัสหน่วย/factor ให้ครบ' };
  centralAppend('product_units', {
    record_id: centralNextId('product_units'), product_id: payload.productId, unit_code: payload.unitCode,
    unit_label: payload.unitLabel || payload.unitCode, unit_factor: payload.unitFactor, price: payload.price || 0, is_active: 'TRUE'
  });
  return { success: true };
}

function updateProductUnit(session, payload) {
  var err = _requirePermission(session, 'products', 'edit'); if (err) return err;
  centralUpdate('product_units', payload.id, {
    unit_label: payload.unitLabel, unit_factor: payload.unitFactor, price: payload.price, is_active: payload.isActive
  });
  return { success: true };
}

// ── Admin App: กลุ่มสินค้า / กลุ่มร้านค้า (ข้อมูลอ้างอิงกลาง ใช้กับโปรโมชั่น) ──
function listProductGroups(session) {
  var err = _requirePermission(session, 'products', 'view'); if (err) return err;
  return { success: true, data: centralObjects('product_groups') };
}
function addProductGroup(session, payload) {
  var err = _requirePermission(session, 'products', 'edit'); if (err) return err;
  centralAppend('product_groups', { record_id: centralNextId('product_groups'), name: payload.name, description: payload.description || '' });
  return { success: true };
}

function listCustomerGroups(session) {
  var err = _requirePermission(session, 'promotions', 'view'); if (err) return err;
  return { success: true, data: centralObjects('customer_groups') };
}
function addCustomerGroup(session, payload) {
  var err = _requirePermission(session, 'promotions', 'edit'); if (err) return err;
  centralAppend('customer_groups', { record_id: centralNextId('customer_groups'), name: payload.name, description: payload.description || '' });
  return { success: true };
}
