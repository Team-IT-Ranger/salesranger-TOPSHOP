/**
 * ===================== VAN STOCK (Mobile App) =====================
 * เบิกของขึ้นรถ / ตรวจนับสต็อกรถ — เวอร์ชัน phase 1 นี้ยังไม่ผูกกับคลังตัวแทน (warehouse)
 * แบบทางการ (ใบเบิก/ใบรับสินค้าเข้าคลังมีเลขเอกสาร) จะทำในสัปดาห์ที่ 2
 */

function restockVan(user, payload) {
  var items = payload.items || [];
  if (!items.length) return { success: false, message: 'ไม่มีรายการเบิก' };

  var sh = tenantSheet(user.tenantId, 'van_stock');
  var data = sh.getDataRange().getValues();
  var hdr = data[0];
  var uidCol = hdr.indexOf('line_user_id'), pidCol = hdr.indexOf('product_id'), qtyCol = hdr.indexOf('qty');

  items.forEach(function(it) {
    var qty = parseInt(it.qty) || 0;
    if (qty <= 0) return;
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][uidCol]) === String(user.lineUserId) && String(data[i][pidCol]) === String(it.productId)) {
        sh.getRange(i + 1, qtyCol + 1).setValue((parseInt(data[i][qtyCol]) || 0) + qty);
        found = true; break;
      }
    }
    if (!found) sh.appendRow([user.lineUserId, it.productId, qty]);
    tenantAppend(user.tenantId, 'stock_movements', { record_id: tenantNextId(user.tenantId, 'stock_movements'), line_user_id: user.lineUserId, product_id: it.productId, change_qty: qty, type: 'restock', ref_id: '', created_at: nowStr() });
  });

  cacheClear('bootstrap', user.lineUserId);
  return { success: true, message: 'เบิกของขึ้นรถสำเร็จ' };
}

function submitCount(user, payload) {
  var items = payload.items || [];
  if (!items.length) return { success: false, message: 'ไม่มีรายการนับ' };

  var sh = tenantSheet(user.tenantId, 'van_stock');
  var data = sh.getDataRange().getValues();
  var hdr = data[0];
  var uidCol = hdr.indexOf('line_user_id'), pidCol = hdr.indexOf('product_id'), qtyCol = hdr.indexOf('qty');

  items.forEach(function(it) {
    var counted = parseInt(it.countedQty) || 0;
    var systemQty = 0;
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][uidCol]) === String(user.lineUserId) && String(data[i][pidCol]) === String(it.productId)) {
        systemQty = parseInt(data[i][qtyCol]) || 0;
        sh.getRange(i + 1, qtyCol + 1).setValue(counted);
        found = true; break;
      }
    }
    if (!found) sh.appendRow([user.lineUserId, it.productId, counted]);
    tenantAppend(user.tenantId, 'stock_counts', { record_id: tenantNextId(user.tenantId, 'stock_counts'), line_user_id: user.lineUserId, product_id: it.productId, system_qty: systemQty, counted_qty: counted, diff_qty: counted - systemQty, created_at: nowStr() });
  });

  cacheClear('bootstrap', user.lineUserId);
  return { success: true, message: 'บันทึกการตรวจนับสำเร็จ' };
}
