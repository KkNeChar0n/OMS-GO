import request from '@/utils/request'

// 获取合同列表
export function getContracts() {
  return request.get('/contracts')
}

// 获取合同详情
export function getContract(id) {
  return request.get(`/contracts/${id}`)
}

// 新增合同
export function createContract(data) {
  return request.post('/contracts', data)
}

// 撤销合同
export function revokeContract(id) {
  return request.put(`/contracts/${id}/revoke`)
}

// 中止合作
export function terminateContract(id, data) {
  return request.put(`/contracts/${id}/terminate`, data)
}

// 获取收款列表
export function getPaymentCollections() {
  return request.get('/payment-collections')
}

// 获取淘宝收款列表
export function getTaobaoPayments() {
  return request.get('/taobao-payments')
}

// 新增收款
export function createPaymentCollection(data) {
  return request.post('/payment-collections', data)
}

// 确认收款到账
export function confirmPaymentCollection(id) {
  return request.put(`/payment-collections/${id}/confirm`)
}

// 删除收款
export function deletePaymentCollection(id) {
  return request.delete(`/payment-collections/${id}`)
}

// 获取启用的学生列表
export function getActiveStudents() {
  return request.get('/students/active')
}

// 获取学生未付款订单
export function getStudentUnpaidOrders(studentId) {
  return request.get(`/students/${studentId}/unpaid-orders`)
}

// 获取订单待支付金额
export function getOrderPendingAmount(orderId) {
  return request.get(`/orders/${orderId}/pending-amount`)
}

// 获取淘宝待认领列表
export function getTaobaoUnclaimed() {
  return request.get('/taobao-unclaimed')
}

// 新增淘宝收款
export function createTaobaoPayment(data) {
  return request.post('/taobao-payments', data)
}

// 确认淘宝收款到账
export function confirmTaobaoPayment(id) {
  return request.put(`/taobao-payments/${id}/confirm`)
}

// 删除淘宝收款
export function deleteTaobaoPayment(id) {
  return request.delete(`/taobao-payments/${id}`)
}

// 认领淘宝待认领
export function claimTaobaoPayment(id, data) {
  return request.put(`/taobao-unclaimed/${id}/claim`, data)
}

// 删除淘宝待认领
export function deleteTaobaoUnclaimed(id) {
  return request.delete(`/taobao-unclaimed/${id}`)
}

// 下载淘宝待认领模板
export function downloadTaobaoTemplate() {
  return request.get('/taobao-unclaimed/template', { responseType: 'blob' })
}

// 导入淘宝待认领Excel
export function importTaobaoExcel(formData) {
  return request.post('/taobao-unclaimed/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 获取常规待认领列表
export function getUnclaimedList() {
  return request.get('/unclaimed')
}

// 认领常规待认领
export function claimUnclaimed(id, data) {
  return request.put(`/unclaimed/${id}/claim`, data)
}

// 删除常规待认领
export function deleteUnclaimed(id) {
  return request.delete(`/unclaimed/${id}`)
}

// 下载常规待认领模板
export function downloadUnclaimedTemplate() {
  return request.get('/unclaimed/template', { responseType: 'blob' })
}

// 导入常规待认领Excel
export function importUnclaimedExcel(formData) {
  return request.post('/unclaimed/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
