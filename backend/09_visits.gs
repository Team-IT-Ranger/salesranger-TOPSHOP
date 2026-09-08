/**
 * ===================== VISITS (Mobile App) =====================
 * เช็คอินเยี่ยมร้าน / บันทึกโน้ต / บันทึกราคาคู่แข่ง — tenant-scoped
 */

function checkInVisit(user, payload) {
  var visitId = tenantNextId(user.tenantId, 'visits');
  tenantAppend(user.tenantId, 'visits', {
    record_id: visitId, customer_id: payload.customerId || 0, line_user_id: user.lineUserId,
    check_in_at: nowStr(), lat: payload.lat || '', lng: payload.lng || '', has_order: 0
  });
  return { success: true, visitId: visitId };
}

function addVisitNote(user, payload) {
  tenantAppend(user.tenantId, 'visit_notes', {
    record_id: tenantNextId(user.tenantId, 'visit_notes'), visit_id: payload.visitId || 0,
    note: payload.note || '', created_at: nowStr()
  });
  return { success: true, message: 'บันทึกสำเร็จ' };
}

function addCompetitor(user, payload) {
  tenantAppend(user.tenantId, 'competitor_logs', {
    record_id: tenantNextId(user.tenantId, 'competitor_logs'), visit_id: payload.visitId || 0,
    customer_id: payload.customerId || 0, brand: payload.competitorName || '',
    product: payload.productName || '', price: parseFloat(payload.price) || 0, created_at: nowStr()
  });
  return { success: true, message: 'บันทึกสำเร็จ' };
}
