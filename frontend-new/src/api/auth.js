import request from '@/utils/request'

// 登录
export function login(username, password) {
  return request.post('/login', { username, password })
}

// 登出
export function logout() {
  return request.post('/logout')
}

// 获取用户信息
export function getProfile() {
  return request.get('/profile')
}

// 同步角色
export function syncRole() {
  return request.get('/sync-role')
}
