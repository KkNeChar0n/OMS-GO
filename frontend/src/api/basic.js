import request from '@/utils/request'

// 获取所有性别
export function getAllSexes() {
  return request.get('/sexes')
}

// 获取启用的年级
export function getActiveGrades() {
  return request.get('/grades/active')
}

// 获取启用的学科
export function getActiveSubjects() {
  return request.get('/subjects/active')
}
