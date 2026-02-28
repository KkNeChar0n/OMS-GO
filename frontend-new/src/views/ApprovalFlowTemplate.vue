<template>
  <div class="approval-flow-template-page" style="position: relative;">
    <!-- Loading遮罩层 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <div class="page-header">
      <h1>审批流模板</h1>
      <button v-if="hasPermission('add_approval_template')" class="add-btn" @click="openAddDrawer">新增审批流</button>
    </div>

    <!-- 筛选表单 -->
    <div class="filter-form">
      <div class="filter-row">
        <div class="filter-item">
          <label for="flowTemplateIdFilter">ID</label>
          <input type="number" id="flowTemplateIdFilter" v-model="filters.id" placeholder="请输入ID">
        </div>
        <div class="filter-item">
          <label for="flowTemplateTypeFilter">审批流类型</label>
          <select id="flowTemplateTypeFilter" v-model="filters.approval_flow_type_id">
            <option value="">全部</option>
            <option v-for="type in approvalFlowTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="flowTemplateNameFilter">模板名称</label>
          <input type="text" id="flowTemplateNameFilter" v-model="filters.name" placeholder="请输入模板名称">
        </div>
        <div class="filter-item">
          <label for="flowTemplateStatusFilter">状态</label>
          <select id="flowTemplateStatusFilter" v-model="filters.status">
            <option value="">全部</option>
            <option value="0">启用</option>
            <option value="1">禁用</option>
          </select>
        </div>
      </div>
      <div class="filter-actions">
        <button class="search-btn" @click="handleSearch">搜索</button>
        <button class="reset-btn" @click="handleReset">重置</button>
      </div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>审批流类型</th>
          <th>模板名称</th>
          <th>创建人</th>
          <th>创建时间</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="template in paginatedData" :key="template.id">
          <td>{{ template.id }}</td>
          <td>{{ template.flow_type_name }}</td>
          <td>{{ template.name }}</td>
          <td>{{ template.creator }}</td>
          <td>{{ template.create_time }}</td>
          <td>{{ template.status === 0 ? '启用' : '禁用' }}</td>
          <td class="action-column">
            <button class="view-btn" @click="openViewDrawer(template)">详情</button>
            <button v-if="template.status === 1" class="enable-btn" @click="openEnableConfirm(template)">启用</button>
            <button v-if="template.status === 0" class="disable-btn" @click="openDisableConfirm(template)">禁用</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 分页控件 -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" @click="changePage(1)" :disabled="currentPage === 1">首页</button>
      <button class="page-btn" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
      <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button class="page-btn" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">下一页</button>
      <button class="page-btn" @click="changePage(totalPages)" :disabled="currentPage === totalPages">末页</button>
    </div>

    <!-- 新增审批流模板弹窗 -->
    <div class="drawer-overlay" v-if="showAddDrawer" @click="closeAddDrawer">
      <div class="drawer drawer-large" @click.stop>
        <div class="drawer-header">
          <h3>新增审批流</h3>
          <button class="close-btn" @click="closeAddDrawer">&times;</button>
        </div>
        <div class="drawer-body">
          <!-- 模板名称和审批流类型在一行 -->
          <div class="form-row">
            <div class="form-group" style="flex: 1;">
              <label>模板名称 <span class="required">*</span></label>
              <input type="text" v-model="addFormData.name" placeholder="请输入模板名称" required>
            </div>
            <div class="form-group" style="flex: 1; margin-left: 15px;">
              <label>审批流类型 <span class="required">*</span></label>
              <select v-model.number="addFormData.approval_flow_type_id" class="styled-select" required>
                <option value="">请选择审批流类型</option>
                <option v-for="type in activeApprovalFlowTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
              </select>
            </div>
          </div>

          <!-- 流程设置 -->
          <div class="form-group">
            <label>流程设置 <span class="required">*</span></label>
            <div class="approval-nodes">
              <div v-for="(node, nodeIndex) in addFormData.nodes" :key="nodeIndex" class="approval-node">
                <div class="node-header">
                  <h4>节点{{ nodeIndex + 1 }}</h4>
                  <div class="node-actions">
                    <button type="button" class="add-node-btn" @click="addNode">+</button>
                    <button type="button" class="remove-node-btn" @click="removeNode(nodeIndex)" :disabled="addFormData.nodes.length === 1">-</button>
                  </div>
                </div>
                <div class="node-content">
                  <!-- 节点名称和审批类型在一行 -->
                  <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                      <label>节点名称 <span class="required">*</span></label>
                      <input type="text" v-model="node.name" placeholder="请输入节点名称" required>
                    </div>
                    <div class="form-group" style="flex: 1; margin-left: 15px;">
                      <label>审批类型 <span class="required">*</span></label>
                      <select v-model.number="node.type" class="styled-select" required>
                        <option :value="0">会签</option>
                        <option :value="1">或签</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>审批人员 <span class="required">*</span></label>
                    <div class="approver-list">
                      <div v-for="(approver, approverIndex) in node.approvers" :key="approverIndex" class="approver-item">
                        <select v-model.number="node.approvers[approverIndex]" class="styled-select" required>
                          <option value="">请选择审批人员</option>
                          <option v-for="user in activeUserAccounts" :key="user.id" :value="user.id">{{ user.username }}</option>
                        </select>
                        <button type="button" class="add-approver-btn" @click="addApprover(nodeIndex)">+</button>
                        <button type="button" class="remove-approver-btn" @click="removeApprover(nodeIndex, approverIndex)" :disabled="node.approvers.length === 1">-</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 抄送 -->
              <div class="approval-node copy-section">
                <div class="node-header">
                  <h4>抄送</h4>
                </div>
                <div class="node-content">
                  <div class="form-group">
                    <label>抄送人员</label>
                    <div class="approver-list">
                      <div v-for="(copyUser, copyIndex) in addFormData.copy_users" :key="copyIndex" class="approver-item">
                        <select v-model.number="addFormData.copy_users[copyIndex]" class="styled-select">
                          <option value="">请选择抄送人员</option>
                          <option v-for="user in activeUserAccounts" :key="user.id" :value="user.id">{{ user.username }}</option>
                        </select>
                        <button type="button" class="add-approver-btn" @click="addCopyUser">+</button>
                        <button type="button" class="remove-approver-btn" @click="removeCopyUser(copyIndex)">-</button>
                      </div>
                      <button v-if="addFormData.copy_users.length === 0" type="button" class="add-included-btn" @click="addCopyUser">+ 添加抄送人员</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="drawer-footer">
          <button class="cancel-btn" @click="closeAddDrawer">取消</button>
          <button class="save-btn" @click="saveTemplate">保存</button>
        </div>
      </div>
    </div>

    <!-- 查看审批流模板详情弹窗 -->
    <div class="drawer-overlay" v-if="showViewDrawer" @click="closeViewDrawer">
      <div class="drawer drawer-large" @click.stop>
        <div class="drawer-header">
          <h3>审批流详情</h3>
          <button class="close-btn" @click="closeViewDrawer">&times;</button>
        </div>
        <div class="drawer-body">
          <!-- 模板名称和审批流类型在一行 -->
          <div class="form-row">
            <div class="form-group" style="flex: 1;">
              <label>模板名称</label>
              <input type="text" :value="viewFormData.name" readonly disabled>
            </div>
            <div class="form-group" style="flex: 1; margin-left: 15px;">
              <label>审批流类型</label>
              <input type="text" :value="viewFormData.flow_type_name" readonly disabled>
            </div>
          </div>

          <!-- 流程设置 -->
          <div class="form-group">
            <label>流程设置</label>
            <div class="approval-nodes">
              <div v-for="(node, nodeIndex) in viewFormData.nodes" :key="nodeIndex" class="approval-node">
                <div class="node-header">
                  <h4>节点{{ nodeIndex + 1 }}</h4>
                </div>
                <div class="node-content">
                  <!-- 节点名称和审批类型在一行 -->
                  <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                      <label>节点名称</label>
                      <input type="text" :value="node.name" readonly disabled>
                    </div>
                    <div class="form-group" style="flex: 1; margin-left: 15px;">
                      <label>审批类型</label>
                      <input type="text" :value="node.type === 0 ? '会签' : '或签'" readonly disabled>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>审批人员</label>
                    <div class="approver-list">
                      <div v-for="(approver, approverIndex) in node.approvers" :key="approverIndex" class="approver-item">
                        <input type="text" :value="approver.username" readonly disabled>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 抄送 -->
              <div v-if="viewFormData.copy_users.length > 0" class="approval-node copy-section">
                <div class="node-header">
                  <h4>抄送</h4>
                </div>
                <div class="node-content">
                  <div class="form-group">
                    <label>抄送人员</label>
                    <div class="approver-list">
                      <div v-for="(copyUser, copyIndex) in viewFormData.copy_users" :key="copyIndex" class="approver-item">
                        <input type="text" :value="copyUser.username" readonly disabled>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="drawer-footer">
          <button class="cancel-btn" @click="closeViewDrawer">关闭</button>
        </div>
      </div>
    </div>

    <!-- 启用确认弹窗 -->
    <div class="modal-overlay" v-if="showEnableConfirm">
      <div class="modal">
        <div class="modal-header">
          <h2>确认启用</h2>
        </div>
        <div class="modal-body">
          <p>是否启用该审批流模板？</p>
          <p style="color: #e74c3c; font-size: 14px;">注意：相同类型的审批流模板仅可生效一个，启用后将自动禁用其他同类型模板。</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showEnableConfirm = false">取消</button>
          <button class="confirm-btn" @click="doEnable">确认</button>
        </div>
      </div>
    </div>

    <!-- 禁用确认弹窗 -->
    <div class="modal-overlay" v-if="showDisableConfirm">
      <div class="modal">
        <div class="modal-header">
          <h2>确认禁用</h2>
        </div>
        <div class="modal-body">
          <p>是否禁用该审批流模板？</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showDisableConfirm = false">取消</button>
          <button class="delete-btn" @click="doDisable">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getApprovalFlowTemplates, getApprovalFlowTemplateDetail, createApprovalFlowTemplate, updateApprovalFlowTemplateStatus } from '../api/approval'
import { getApprovalFlowTypes } from '../api/approval'
import { getAccounts } from '../api/account'
import { usePermissionStore } from '../store/modules/permission'

export default {
  name: 'ApprovalFlowTemplate',
  data() {
    return {
      loading: false,
      approvalFlowTemplates: [],
      approvalFlowTypes: [],
      filteredData: [],
      filters: {
        id: '',
        approval_flow_type_id: '',
        name: '',
        status: ''
      },
      currentPage: 1,
      pageSize: 10,
      showAddDrawer: false,
      showViewDrawer: false,
      showEnableConfirm: false,
      showDisableConfirm: false,
      currentTemplate: null,
      addFormData: {
        name: '',
        approval_flow_type_id: '',
        nodes: [{
          name: '',
          type: 0,
          approvers: ['']
        }],
        copy_users: []
      },
      viewFormData: {
        name: '',
        approval_flow_type_id: '',
        flow_type_name: '',
        nodes: [],
        copy_users: []
      },
      activeApprovalFlowTypes: [],
      activeUserAccounts: []
    }
  },
  computed: {
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredData.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.pageSize)
    }
  },
  mounted() {
    this.fetchData()
    this.fetchApprovalFlowTypes()
  },
  methods: {
    hasPermission(actionId) {
      const permissionStore = usePermissionStore()
      return permissionStore.hasPermission(actionId)
    },
    async fetchData() {
      this.loading = true
      try {
        const params = {}
        if (this.filters.id) params.id = this.filters.id
        if (this.filters.approval_flow_type_id) params.approval_flow_type_id = this.filters.approval_flow_type_id
        if (this.filters.name) params.name = this.filters.name
        if (this.filters.status !== '') params.status = this.filters.status

        const response = await getApprovalFlowTemplates(params)
        this.approvalFlowTemplates = response.data.data.approval_flow_templates || []
        this.filteredData = this.approvalFlowTemplates
      } catch (error) {
        console.error('获取审批流模板失败:', error)
        alert(error.response?.data?.error || '获取审批流模板失败')
      } finally {
        this.loading = false
      }
    },
    async fetchApprovalFlowTypes() {
      try {
        const response = await getApprovalFlowTypes({})
        this.approvalFlowTypes = response.data.data.approval_flow_types || []
      } catch (error) {
        console.error('获取审批流类型失败:', error)
      }
    },
    handleSearch() {
      this.fetchData()
      this.currentPage = 1
    },
    handleReset() {
      this.filters = {
        id: '',
        approval_flow_type_id: '',
        name: '',
        status: ''
      }
      this.fetchData()
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    async openAddDrawer() {
      try {
        // 获取启用的审批流类型
        const typesResponse = await getApprovalFlowTypes({ status: 0 })
        this.activeApprovalFlowTypes = typesResponse.data.data.approval_flow_types || []

        // 获取启用的用户账号
        const accountsResponse = await getAccounts({ status: 0 })
        this.activeUserAccounts = accountsResponse.data.accounts || []

        this.showAddDrawer = true
      } catch (error) {
        console.error('获取数据失败:', error)
        alert(error.response?.data?.error || '获取数据失败')
      }
    },
    closeAddDrawer() {
      this.showAddDrawer = false
      this.addFormData = {
        name: '',
        approval_flow_type_id: '',
        nodes: [{
          name: '',
          type: 0,
          approvers: ['']
        }],
        copy_users: []
      }
    },
    addNode() {
      this.addFormData.nodes.push({
        name: '',
        type: 0,
        approvers: ['']
      })
    },
    removeNode(nodeIndex) {
      if (this.addFormData.nodes.length > 1) {
        this.addFormData.nodes.splice(nodeIndex, 1)
      }
    },
    addApprover(nodeIndex) {
      this.addFormData.nodes[nodeIndex].approvers.push('')
    },
    removeApprover(nodeIndex, approverIndex) {
      const node = this.addFormData.nodes[nodeIndex]
      if (node.approvers.length > 1) {
        node.approvers.splice(approverIndex, 1)
      }
    },
    addCopyUser() {
      this.addFormData.copy_users.push('')
    },
    removeCopyUser(copyIndex) {
      this.addFormData.copy_users.splice(copyIndex, 1)
    },
    async saveTemplate() {
      // 验证
      if (!this.addFormData.name) {
        alert('请输入模板名称')
        return
      }

      if (!this.addFormData.approval_flow_type_id) {
        alert('请选择审批流类型')
        return
      }

      // 验证节点
      for (let i = 0; i < this.addFormData.nodes.length; i++) {
        const node = this.addFormData.nodes[i]
        if (!node.name) {
          alert(`请输入节点${i + 1}的名称`)
          return
        }

        // 过滤空的审批人员
        const validApprovers = node.approvers.filter(a => a !== '')
        if (validApprovers.length === 0) {
          alert(`节点${i + 1}至少需要一个审批人员`)
          return
        }
        node.approvers = validApprovers
      }

      // 过滤空的抄送人员
      this.addFormData.copy_users = this.addFormData.copy_users.filter(u => u !== '')

      try {
        await createApprovalFlowTemplate(this.addFormData)
        alert('审批流模板创建成功')
        this.closeAddDrawer()
        await this.fetchData()
      } catch (error) {
        console.error('创建审批流模板失败:', error)
        alert(error.response?.data?.error || '创建审批流模板失败')
      }
    },
    async openViewDrawer(template) {
      try {
        const response = await getApprovalFlowTemplateDetail(template.id)
        const data = response.data.data

        this.viewFormData = {
          name: data.template.name,
          approval_flow_type_id: data.template.approval_flow_type_id,
          flow_type_name: data.template.flow_type_name,
          nodes: data.nodes || [],
          copy_users: data.copy_users || []
        }

        this.showViewDrawer = true
      } catch (error) {
        console.error('获取审批流模板详情失败:', error)
        alert(error.response?.data?.error || '获取审批流模板详情失败')
      }
    },
    closeViewDrawer() {
      this.showViewDrawer = false
      this.viewFormData = {
        name: '',
        approval_flow_type_id: '',
        flow_type_name: '',
        nodes: [],
        copy_users: []
      }
    },
    openEnableConfirm(template) {
      this.currentTemplate = template
      this.showEnableConfirm = true
    },
    openDisableConfirm(template) {
      this.currentTemplate = template
      this.showDisableConfirm = true
    },
    async doEnable() {
      try {
        await updateApprovalFlowTemplateStatus(this.currentTemplate.id, { status: 0 })
        alert('审批流模板已启用')
        this.showEnableConfirm = false
        this.currentTemplate = null
        await this.fetchData()
      } catch (error) {
        console.error('启用审批流模板失败:', error)
        alert(error.response?.data?.error || '启用审批流模板失败')
      }
    },
    async doDisable() {
      try {
        await updateApprovalFlowTemplateStatus(this.currentTemplate.id, { status: 1 })
        alert('审批流模板已禁用')
        this.showDisableConfirm = false
        this.currentTemplate = null
        await this.fetchData()
      } catch (error) {
        console.error('禁用审批流模板失败:', error)
        alert(error.response?.data?.error || '禁用审批流模板失败')
      }
    }
  }
}
</script>

<style scoped>
.approval-flow-template-page {
  padding: 20px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 10px;
  color: #666;
}

.drawer-large {
  width: 800px;
  max-width: 90vw;
}

.approval-nodes {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
}

.approval-node {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

.approval-node:last-child {
  margin-bottom: 0;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.node-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.node-actions {
  display: flex;
  gap: 5px;
}

.add-node-btn,
.remove-node-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.add-node-btn {
  background-color: #3498db;
  color: white;
}

.add-node-btn:hover {
  background-color: #2980b9;
}

.remove-node-btn {
  background-color: #e74c3c;
  color: white;
}

.remove-node-btn:hover {
  background-color: #c0392b;
}

.remove-node-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.node-content {
  padding: 0;
}

.approver-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.approver-item {
  display: flex;
  gap: 5px;
  align-items: center;
}

.approver-item select,
.approver-item input {
  flex: 1;
}

.add-approver-btn,
.remove-approver-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.add-approver-btn {
  background-color: #27ae60;
  color: white;
}

.add-approver-btn:hover {
  background-color: #229954;
}

.remove-approver-btn {
  background-color: #e74c3c;
  color: white;
}

.remove-approver-btn:hover {
  background-color: #c0392b;
}

.remove-approver-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.add-included-btn {
  padding: 8px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.add-included-btn:hover {
  background-color: #2980b9;
}

.copy-section {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-group-col {
  flex: 1;
}

.required {
  color: #e74c3c;
}

.styled-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.readonly-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style>
