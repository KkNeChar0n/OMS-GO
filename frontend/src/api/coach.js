import request from '@/utils/request'

// 获取教练列表
export function getCoaches(params) {
  return request.get('/coaches', { params })
}

// 获取启用的教练列表
export function getActiveCoaches() {
  return request.get('/coaches/active')
}

// 获取单个教练
export function getCoach(id) {
  return request.get(`/coaches/${id}`)
}

// 新增教练
export function createCoach(data) {
  return request.post('/coaches', data)
}

// 更新教练
export function updateCoach(id, data) {
  return request.put(`/coaches/${id}`, data)
}

// 删除教练
export function deleteCoach(id) {
  return request.delete(`/coaches/${id}`)
}

// 更新教练状态
export function updateCoachStatus(id, status) {
  return request.put(`/coaches/${id}/status`, { status })
}
