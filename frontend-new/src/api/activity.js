import request from '@/utils/request'

// 获取活动列表
export function getActivities(params) {
  return request.get('/activities', { params })
}

// 获取启用的活动列表
export function getActiveActivities() {
  return request.get('/activities/active')
}

// 获取单个活动
export function getActivity(id) {
  return request.get(`/activities/${id}`)
}

// 新增活动
export function createActivity(data) {
  return request.post('/activities', data)
}

// 更新活动
export function updateActivity(id, data) {
  return request.put(`/activities/${id}`, data)
}

// 删除活动
export function deleteActivity(id) {
  return request.delete(`/activities/${id}`)
}

// 更新活动状态
export function updateActivityStatus(id, status) {
  return request.put(`/activities/${id}/status`, { status })
}

// 按日期范围查询活动
export function getActivitiesByDateRange(params) {
  return request.get('/activities/by-date-range', { params })
}
