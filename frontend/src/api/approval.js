import request from '../utils/request'

// ==================== 审批流类型接口 ====================

/**
 * 获取审批流类型列表
 * @param {Object} params - 查询参数 { id, name, status }
 */
export function getApprovalFlowTypes(params) {
  return request({
    url: '/approval-flow-types',
    method: 'get',
    params
  })
}

/**
 * 更新审批流类型状态
 * @param {number} id - 审批流类型ID
 * @param {Object} data - { status: 0|1 }
 */
export function updateApprovalFlowTypeStatus(id, data) {
  return request({
    url: `/approval-flow-types/${id}/status`,
    method: 'put',
    data
  })
}

// ==================== 审批流模板接口 ====================

/**
 * 获取审批流模板列表
 * @param {Object} params - 查询参数 { id, approval_flow_type_id, name, status }
 */
export function getApprovalFlowTemplates(params) {
  return request({
    url: '/approval-flow-templates',
    method: 'get',
    params
  })
}

/**
 * 获取审批流模板详情
 * @param {number} id - 模板ID
 */
export function getApprovalFlowTemplateDetail(id) {
  return request({
    url: `/approval-flow-templates/${id}`,
    method: 'get'
  })
}

/**
 * 创建审批流模板
 * @param {Object} data - { name, approval_flow_type_id, nodes, copy_users }
 */
export function createApprovalFlowTemplate(data) {
  return request({
    url: '/approval-flow-templates',
    method: 'post',
    data
  })
}

/**
 * 更新审批流模板状态
 * @param {number} id - 模板ID
 * @param {Object} data - { status: 0|1 }
 */
export function updateApprovalFlowTemplateStatus(id, data) {
  return request({
    url: `/approval-flow-templates/${id}/status`,
    method: 'put',
    data
  })
}

// ==================== 审批流管理接口 ====================

/**
 * 获取我发起的审批流列表
 * @param {Object} params - 查询参数 { id, approval_flow_type_id, status }
 */
export function getInitiatedFlows(params) {
  return request({
    url: '/approval-flows/initiated',
    method: 'get',
    params
  })
}

/**
 * 获取待我审批的任务列表
 * @param {Object} params - 查询参数 { id, approval_flow_id, approval_flow_type_id }
 */
export function getPendingFlows(params) {
  return request({
    url: '/approval-flows/pending',
    method: 'get',
    params
  })
}

/**
 * 获取处理完成的审批列表
 * @param {Object} params - 查询参数 { id, approval_flow_id, approval_flow_type_id }
 */
export function getCompletedFlows(params) {
  return request({
    url: '/approval-flows/completed',
    method: 'get',
    params
  })
}

/**
 * 获取抄送我的通知列表
 * @param {Object} params - 查询参数 { id, approval_flow_id, approval_flow_type_id }
 */
export function getCopiedFlows(params) {
  return request({
    url: '/approval-flows/copied',
    method: 'get',
    params
  })
}

/**
 * 获取审批流详情
 * @param {number} id - 审批流ID
 */
export function getApprovalFlowDetail(id) {
  return request({
    url: `/approval-flows/${id}/detail`,
    method: 'get'
  })
}

/**
 * 撤销审批流
 * @param {number} id - 审批流ID
 */
export function cancelApprovalFlow(id) {
  return request({
    url: `/approval-flows/${id}/cancel`,
    method: 'put'
  })
}

/**
 * 审批通过
 * @param {Object} data - { node_case_user_id }
 */
export function approveFlow(data) {
  return request({
    url: '/approval-flows/approve',
    method: 'post',
    data
  })
}

/**
 * 审批驳回
 * @param {Object} data - { node_case_user_id }
 */
export function rejectFlow(data) {
  return request({
    url: '/approval-flows/reject',
    method: 'post',
    data
  })
}

/**
 * 从模板创建审批流
 * @param {Object} data - { template_id, ... }
 */
export function createFlowFromTemplate(data) {
  return request({
    url: '/approval-flows/create-from-template',
    method: 'post',
    data
  })
}
