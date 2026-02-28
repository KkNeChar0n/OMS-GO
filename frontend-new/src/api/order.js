import request from '@/utils/request'

// 获取订单列表
export function getOrders(params) {
  return request.get('/orders', { params })
}

// 获取单个订单
export function getOrder(id) {
  return request.get(`/orders/${id}`)
}

// 新增订单
export function createOrder(data) {
  return request.post('/orders', data)
}

// 更新订单
export function updateOrder(id, data) {
  return request.put(`/orders/${id}`, data)
}

// 提交订单
export function submitOrder(id) {
  return request.put(`/orders/${id}/submit`)
}

// 作废订单
export function cancelOrder(id) {
  return request.put(`/orders/${id}/cancel`)
}

// 获取订单商品列表
export function getOrderGoods(id) {
  return request.get(`/orders/${id}/goods`)
}

// 获取订单待付金额
export function getOrderPendingAmount(id) {
  return request.get(`/orders/${id}/pending-amount`)
}

// 获取订单退费信息
export function getOrderRefundInfo(id) {
  return request.get(`/orders/${id}/refund-info`)
}

// 获取退费收款列表
export function getRefundPayments(id, data) {
  return request.post(`/orders/${id}/refund-payments`, data)
}

// 计算订单优惠
export function calculateDiscount(data) {
  return request.post('/orders/calculate-discount', data)
}

// 获取子订单列表
export function getChildOrders(params) {
  return request.get('/childorders', { params })
}
