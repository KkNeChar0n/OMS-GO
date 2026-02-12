import request from '@/utils/request'

// 获取账号列表
export function getAccounts(params) {
  return request.get('/accounts', { params })
}

// 获取单个账号
export function getAccount(id) {
  return request.get(`/accounts/${id}`)
}

// 新增账号
export function createAccount(data) {
  return request.post('/accounts', data)
}

// 更新账号
export function updateAccount(id, data) {
  return request.put(`/accounts/${id}`, data)
}

// 删除账号
export function deleteAccount(id) {
  return request.delete(`/accounts/${id}`)
}

// 更新账号状态
export function updateAccountStatus(id, status) {
  return request.put(`/accounts/${id}/status`, { status })
}

// 重置账号密码
export function resetAccountPassword(id, password) {
  return request.put(`/accounts/${id}/password`, { password })
}
