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
