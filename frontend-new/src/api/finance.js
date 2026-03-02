import request from '@/utils/request'

// ==================== 子订单管理 ====================

// 获取子订单列表
export function getChildOrders(params) {
  return request({
    url: '/childorders',
    method: 'get',
    params
  })
}

// ==================== 收款管理 ====================

// 获取常规收款列表
export function getPaymentCollections(params) {
  return request({
    url: '/payment-collections',
    method: 'get',
    params
  })
}

// 新增常规收款
export function createPaymentCollection(data) {
  return request({
    url: '/payment-collections',
    method: 'post',
    data
  })
}

// 确认到账
export function confirmPaymentCollection(id) {
  return request({
    url: `/payment-collections/${id}/confirm`,
    method: 'put'
  })
}

// 删除收款
export function deletePaymentCollection(id) {
  return request({
    url: `/payment-collections/${id}`,
    method: 'delete'
  })
}

// 获取淘宝收款列表
export function getTaobaoPayments(params) {
  return request({
    url: '/taobao-payments',
    method: 'get',
    params
  })
}

// 新增淘宝收款
export function createTaobaoPayment(data) {
  return request({
    url: '/taobao-payments',
    method: 'post',
    data
  })
}

// 确认淘宝收款到账
export function confirmTaobaoPayment(id) {
  return request({
    url: `/taobao-payments/${id}/confirm`,
    method: 'put'
  })
}

// 删除淘宝收款
export function deleteTaobaoPayment(id) {
  return request({
    url: `/taobao-payments/${id}`,
    method: 'delete'
  })
}

// ==================== 分账明细 ====================

// 获取分账明细列表
export function getSeparateAccounts(params) {
  return request({
    url: '/separate-accounts',
    method: 'get',
    params
  })
}

// ==================== 退费管理 ====================

// 获取退费订单列表
export function getRefundOrders(params) {
  return request({
    url: '/refund-orders',
    method: 'get',
    params
  })
}

// 获取退费订单详情
export function getRefundOrderDetail(id) {
  return request({
    url: `/refund-orders/${id}`,
    method: 'get'
  })
}

// 获取子退费订单列表
export function getRefundChildOrders(params) {
  return request({
    url: '/refund-childorders',
    method: 'get',
    params
  })
}

// 获取退费明细列表
export function getRefundPaymentDetails(params) {
  return request({
    url: '/refund-payment-details',
    method: 'get',
    params
  })
}

// 获取常规退费列表
export function getRegularRefunds(params) {
  return request({
    url: '/refund-regular-supplements',
    method: 'get',
    params
  })
}

// 获取淘宝退费列表
export function getTaobaoRefunds(params) {
  return request({
    url: '/refund-taobao-supplements',
    method: 'get',
    params
  })
}
