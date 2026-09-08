/**
 * ===================== TENANT ONBOARDING (บริษัทเจ้าของสินค้าเท่านั้น) =====================
 * สร้าง Google Sheet ใหม่ 1 ไฟล์ต่อตัวแทนจำหน่าย 1 ราย พร้อม tab ธุรกรรมทั้งหมด
 * แล้วบันทึก sheet_file_id ไว้ที่ tenants tab (Central Sheet)
 */

var TENANT_SHEET_TABS = {
  sales_orders:        ['record_id','order_code','customer_id','subtotal','discount','total','payment_method','fulfillment_type','status','sale_by','lat','lng','map','note','created_at'],
  // qty/price/line_total เป็น "หน่วยที่ขายจริง" (เช่น ลัง) ตรงกับที่ลูกค้าเห็นบนบิล
  // base_qty คือจำนวนแปลงเป็นหน่วยฐานแล้ว (qty × unit_factor) ใช้ตัดสต็อกและเช็คโปรโมชั่นเท่านั้น
  order_items:         ['record_id','order_id','product_id','unit_code','unit_factor','qty','base_qty','price','line_total','is_free'],
  order_discounts:     ['record_id','order_id','rule_id','rule_name','type','value','free_product_id','free_qty'],
  van_stock:           ['line_user_id','product_id','qty'],
  stock_movements:     ['record_id','line_user_id','product_id','change_qty','type','ref_id','created_at'],
  stock_counts:        ['record_id','line_user_id','product_id','system_qty','counted_qty','diff_qty','created_at'],
  visits:              ['record_id','customer_id','line_user_id','check_in_at','lat','lng','has_order'],
  visit_notes:         ['record_id','visit_id','note','created_at'],
  competitor_logs:     ['record_id','visit_id','customer_id','brand','product','price','created_at'],
  doc_number_series:   ['record_id','doc_type','prefix','date_format','running_digits','reset_cycle','separator','is_active'],
  doc_number_counters: ['doc_type','period_key','last_number']
};

function _buildTenantSpreadsheet(tenantId, tenantName) {
  var newSS = SpreadsheetApp.create('salesranger-TOPSHOP-' + tenantId);
  var fileId = newSS.getId();

  Object.keys(TENANT_SHEET_TABS).forEach(function(tabName) {
    var headers = TENANT_SHEET_TABS[tabName];
    var sh = newSS.insertSheet(tabName);
    sh.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#0B7B52').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    sh.setColumnWidths(1, headers.length, 140);
  });

  var defaultSheet = newSS.getSheetByName('Sheet1') || newSS.getSheetByName('แผ่น1');
  if (defaultSheet) newSS.deleteSheet(defaultSheet);

  // seed เลขเอกสารเริ่มต้น (SO) — ตัวแทนแก้ปรับรูปแบบเองได้ทีหลังผ่าน Admin App
  var docSh = newSS.getSheetByName('doc_number_series');
  docSh.appendRow([1, 'SO', 'SO', 'yyyyMMdd', 4, 'daily', '-', 'TRUE']);

  SpreadsheetApp.flush();
  return fileId;
}

// เรียกจาก Admin App โดย super_admin/owner_admin เท่านั้น
function createTenant(session, payload) {
  var err = _requirePermission(session, 'tenants', 'edit'); if (err) return err;
  if (!payload.tenantId || !payload.name) return { success: false, message: 'กรุณาระบุรหัสและชื่อตัวแทน' };

  var existing = centralObjects('tenants');
  if (existing.some(function(t) { return String(t.tenant_id) === String(payload.tenantId); })) {
    return { success: false, message: 'มีรหัสตัวแทนนี้อยู่แล้ว: ' + payload.tenantId };
  }

  var fileId = _buildTenantSpreadsheet(payload.tenantId, payload.name);
  centralAppend('tenants', {
    tenant_id: payload.tenantId, name: payload.name, sheet_file_id: fileId,
    region: payload.region || '', is_active: 'TRUE', created_at: nowStr()
  });

  return { success: true, tenantId: payload.tenantId, sheetFileId: fileId, sheetUrl: 'https://docs.google.com/spreadsheets/d/' + fileId };
}

function listTenants(session) {
  var err = _requirePermission(session, 'tenants', 'view'); if (err) return err;
  return { success: true, data: centralObjects('tenants').map(function(t) {
    return { tenantId: t.tenant_id, name: t.name, region: t.region, isActive: t.is_active, sheetUrl: 'https://docs.google.com/spreadsheets/d/' + t.sheet_file_id };
  }) };
}

function updateTenantStatus(session, payload) {
  var err = _requirePermission(session, 'tenants', 'edit'); if (err) return err;
  var rows = centralObjects('tenants');
  var sh = centralSheet('tenants');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].tenant_id) === String(payload.tenantId)) {
      sh.getRange(i + 2, 5).setValue(payload.isActive ? 'TRUE' : 'FALSE'); // col 5 = is_active
      return { success: true };
    }
  }
  return { success: false, message: 'ไม่พบตัวแทนนี้' };
}
