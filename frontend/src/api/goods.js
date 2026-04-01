import request from '@/utils/request'

// ========== 商品管理 ==========

// 获取商品列表
export function getGoods(params) {
  return request.get('/goods', { params })
}

// 获取用于订单的启用商品列表
export function getActiveGoodsForOrder() {
  return request.get('/goods/active-for-order')
}

// 获取商品总价
export function getGoodsTotalPrice(id) {
  return request.get(`/goods/${id}/total-price`)
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

// 更新品牌状态
export function updateBrandStatus(id, status) {
  return request.put(`/brands/${id}/status`, { status })
}

// ========== 分类管理 ==========

// 获取分类列表
export function getClassifies(params) {
  return request.get('/classifies', { params })
}

// 获取父级分类列表（一级分类）
export function getParentClassifies() {
  return request.get('/classifies/parents')
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

// 更新分类状态
export function updateClassifyStatus(id, status) {
  return request.put(`/classifies/${id}/status`, { status })
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

// 更新属性状态
export function updateAttributeStatus(id, status) {
  return request.put(`/attributes/${id}/status`, { status })
}

// 获取属性值列表
export function getAttributeValues(attributeId) {
  return request.get(`/attributes/${attributeId}/values`)
}

// 保存属性值（全量替换）
export function saveAttributeValues(attributeId, values) {
  return request.post(`/attributes/${attributeId}/values`, { values })
}

// 创建属性值
export function createAttributeValue(attributeId, data) {
  return request.post(`/attributes/${attributeId}/values`, data)
}

// 更新属性值
export function updateAttributeValue(attributeId, valueId, data) {
  return request.put(`/attributes/${attributeId}/values/${valueId}`, data)
}

// 删除属性值
export function deleteAttributeValue(attributeId, valueId) {
  return request.delete(`/attributes/${attributeId}/values/${valueId}`)
}

// ========== 组合商品管理 ==========

// 获取可用于组合的商品列表
export function getAvailableGoodsForCombo(excludeId) {
  return request.get('/goods/available-for-combo', {
    params: excludeId ? { exclude_id: excludeId } : {}
  })
}

// 获取商品包含的子商品列表
export function getIncludedGoods(goodsId) {
  return request.get(`/goods/${goodsId}/included-goods`)
}

// ========== 启用数据获取 ==========

// 获取启用的品牌列表
export function getActiveBrands() {
  return request.get('/brands/active')
}

// 获取启用的分类列表
export function getActiveClassifies() {
  return request.get('/classifies/active')
}

// 获取启用的属性列表（包含属性值）
export function getActiveAttributes() {
  return request.get('/attributes/active')
}
