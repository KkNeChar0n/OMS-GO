import request from '@/utils/request'

// 获取学生列表
export function getStudents(params) {
  return request.get('/students', { params })
}

// 获取单个学生
export function getStudent(id) {
  return request.get(`/students/${id}`)
}

// 新增学生
export function createStudent(data) {
  return request.post('/students', data)
}

// 更新学生
export function updateStudent(id, data) {
  return request.put(`/students/${id}`, data)
}

// 删除学生
export function deleteStudent(id) {
  return request.delete(`/students/${id}`)
}

// 更新学生状态
export function updateStudentStatus(id, status) {
  return request.put(`/students/${id}/status`, { status })
}
