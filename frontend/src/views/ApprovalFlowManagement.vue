<template>
  <div class="approval-flow-management-page">
    <div class="page-header">
      <h1>审批流管理</h1>
    </div>

    <!-- Tab导航 -->
    <div class="tab-nav">
      <button class="tab-btn" :class="{active: activeTab === 'initiated'}" @click="switchTab('initiated')">我发起的</button>
      <button class="tab-btn" :class="{active: activeTab === 'pending'}" @click="switchTab('pending')">待我审批</button>
      <button class="tab-btn" :class="{active: activeTab === 'completed'}" @click="switchTab('completed')">处理完成</button>
      <button class="tab-btn" :class="{active: activeTab === 'copied'}" @click="switchTab('copied')">抄送我的</button>
    </div>

    <!-- 我发起的 Tab -->
    <InitiatedFlows v-if="activeTab === 'initiated'" :approval-flow-types="approvalFlowTypes" />

    <!-- 待我审批 Tab -->
    <PendingFlows v-if="activeTab === 'pending'" :approval-flow-types="approvalFlowTypes" />

    <!-- 处理完成 Tab -->
    <CompletedFlows v-if="activeTab === 'completed'" :approval-flow-types="approvalFlowTypes" />

    <!-- 抄送我的 Tab -->
    <CopiedFlows v-if="activeTab === 'copied'" :approval-flow-types="approvalFlowTypes" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getApprovalFlowTypes } from '../api/approval'
import InitiatedFlows from '../components/approval/InitiatedFlows.vue'
import PendingFlows from '../components/approval/PendingFlows.vue'
import CompletedFlows from '../components/approval/CompletedFlows.vue'
import CopiedFlows from '../components/approval/CopiedFlows.vue'

export default {
  name: 'ApprovalFlowManagement',
  components: {
    InitiatedFlows,
    PendingFlows,
    CompletedFlows,
    CopiedFlows
  },
  setup() {
    const activeTab = ref('initiated')
    const approvalFlowTypes = ref([])

    const fetchApprovalFlowTypes = async () => {
      try {
        const response = await getApprovalFlowTypes({})
        approvalFlowTypes.value = response.data.data.approval_flow_types || []
      } catch (error) {
        console.error('获取审批流类型失败:', error)
      }
    }

    const switchTab = (tab) => {
      activeTab.value = tab
    }

    onMounted(() => {
      fetchApprovalFlowTypes()
    })

    return {
      activeTab,
      approvalFlowTypes,
      switchTab
    }
  }
}
</script>

<style scoped>
.approval-flow-management-page {
  padding: 20px;
}

.tab-nav {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-btn {
  padding: 10px 20px;
  background-color: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: #3498db;
}

.tab-btn.active {
  color: #3498db;
  border-bottom-color: #3498db;
  font-weight: bold;
}
</style>
