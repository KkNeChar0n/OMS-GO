import request from '@/utils/request'

// 获取启用的权限列表
export function getEnabledPermissions() {
  return request.get('/enabled-permissions')
}

// 获取菜单树
export function getMenuTree() {
  return request.get('/menu-tree')
}

// 获取角色列表
export function getRoles(params) {
  return request.get('/roles', { params })
}

// 获取权限列表
export function getPermissions(params) {
  return request.get('/permissions', { params })
}

// 获取菜单管理列表
export function getMenuManagement(params) {
  return request.get('/menu-management', { params })
}

// 更新菜单
export function updateMenu(id, data) {
  return request.put(`/menu-management/${id}`, data)
}

// 获取角色权限
export function getRolePermissions(roleId) {
  return request.get(`/roles/${roleId}/permissions`)
}

// 更新角色权限
export function updateRolePermissions(roleId, data) {
  return request.put(`/roles/${roleId}/permissions`, data)
}

// 设置角色权限
export function setRolePermissions(roleId, permissionIds) {
  return request.put(`/roles/${roleId}/permissions`, { permission_ids: permissionIds })
}

// 创建角色
export function createRole(data) {
  return request.post('/roles', data)
}

// 更新角色
export function updateRole(id, data) {
  return request.put(`/roles/${id}`, data)
}

// 更新角色状态
export function updateRoleStatus(id, status) {
  return request.put(`/roles/${id}/status`, { status })
}

// 更新权限状态
export function updatePermissionStatus(id, status) {
  return request.put(`/permissions/${id}/status`, { status })
}

// 更新菜单状态
export function updateMenuStatus(id, status) {
  return request.put(`/menu-management/${id}/status`, { status })
}
