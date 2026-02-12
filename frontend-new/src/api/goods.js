import request from '@/utils/request'

// ========== 商品管理 ==========

// 获取商品列表
export function getGoods(params) {
  return request.get('/goods', { params })
}

// 获取单个商品
export function getGoodsItem(id) {
  return request.get(`/goods/${id}`)
}

// 新增商品
export function createGoods(data) {
  return request.post('/goods', data)
}

// 更新商品
export function updateGoods(id, data) {
  return request.put(`/goods/${id}`, data)
}

// 删除商品
export function deleteGoods(id) {
  return request.delete(`/goods/${id}`)
}

// 更新商品状态
export function updateGoodsStatus(id, status) {
  return request.put(`/goods/${id}/status`, { status })
}

// ========== 品牌管理 ==========

// 获取品牌列表
export function getBrands(params) {
  return request.get('/brands', { params })
}

// 新增品牌
export function createBrand(data) {
  return request.post('/brands', data)
}

// 更新品牌
export function updateBrand(id, data) {
  return request.put(`/brands/${id}`, data)
}

// 删除品牌
export function deleteBrand(id) {
  return request.delete(`/brands/${id}`)
}

// ========== 分类管理 ==========

// 获取分类列表
export function getClassifies(params) {
  return request.get('/classifies', { params })
}

// 新增分类
export function createClassify(data) {
  return request.post('/classifies', data)
}

// 更新分类
export function updateClassify(id, data) {
  return request.put(`/classifies/${id}`, data)
}

// 删除分类
export function deleteClassify(id) {
  return request.delete(`/classifies/${id}`)
}

// ========== 属性管理 ==========

// 获取属性列表
export function getAttributes(params) {
  return request.get('/attributes', { params })
}

// 新增属性
export function createAttribute(data) {
  return request.post('/attributes', data)
}

// 更新属性
export function updateAttribute(id, data) {
  return request.put(`/attributes/${id}`, data)
}

// 删除属性
export function deleteAttribute(id) {
  return request.delete(`/attributes/${id}`)
}
