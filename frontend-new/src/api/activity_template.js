import request from '@/utils/request'

// 获取活动模板列表
export function getActivityTemplates(params) {
  return request.get('/activity-templates', { params })
}

// 获取启用的活动模板列表
export function getActiveActivityTemplates() {
  return request.get('/activity-templates/active')
}

// 获取单个活动模板详情
export function getActivityTemplate(id) {
  return request.get(`/activity-templates/${id}`)
}

// 新增活动模板
export function createActivityTemplate(data) {
  return request.post('/activity-templates', data)
}

// 更新活动模板
export function updateActivityTemplate(id, data) {
  return request.put(`/activity-templates/${id}`, data)
}

// 删除活动模板
export function deleteActivityTemplate(id) {
  return request.delete(`/activity-templates/${id}`)
}

// 更新活动模板状态
export function updateActivityTemplateStatus(id, status) {
  return request.put(`/activity-templates/${id}/status`, { status })
}
