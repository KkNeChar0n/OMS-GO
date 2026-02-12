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

// 删除订单
export function deleteOrder(id) {
  return request.delete(`/orders/${id}`)
}

// 更新订单状态
export function updateOrderStatus(id, status) {
  return request.put(`/orders/${id}/status`, { status })
}

// 获取子订单列表
export function getChildOrders(params) {
  return request.get('/child-orders', { params })
}

// 新增子订单
export function createChildOrder(data) {
  return request.post('/child-orders', data)
}

// 更新子订单
export function updateChildOrder(id, data) {
  return request.put(`/child-orders/${id}`, data)
}

// 删除子订单
export function deleteChildOrder(id) {
  return request.delete(`/child-orders/${id}`)
}
