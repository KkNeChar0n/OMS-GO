// Token 存储和读取
export function getToken() {
  return localStorage.getItem('token')
}

export function setToken(token) {
  localStorage.setItem('token', token)
}

export function removeToken() {
  localStorage.removeItem('token')
}

// 登录状态检查
export function isLoggedIn() {
  return !!getToken()
}

// 权限检查函数
export function hasPermission(permissionId, enabledPermissions, isSuperAdmin) {
  if (isSuperAdmin) {
    return true
  }
  return enabledPermissions.includes(permissionId)
}
