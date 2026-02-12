import request from '@/utils/request'

// 获取合同列表
export function getContracts() {
  return request.get('/contracts')
}

// 获取合同详情
export function getContract(id) {
  return request.get(`/contracts/${id}`)
}

// 新增合同
export function createContract(data) {
  return request.post('/contracts', data)
}

// 撤销合同
export function revokeContract(id) {
  return request.put(`/contracts/${id}/revoke`)
}

// 中止合作
export function terminateContract(id, data) {
  return request.put(`/contracts/${id}/terminate`, data)
}
