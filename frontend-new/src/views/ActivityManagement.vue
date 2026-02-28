<template>
  <div class="page-container" style="position: relative;">
    <!-- Loading遮罩层 -->
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>活动管理</h1>
        <button v-if="hasPermission('add_activity')" class="add-btn" @click="openAddActivityDrawer">新增</button>
      </div>

      <!-- 筛选表单 -->
      <div class="filter-form">
        <div class="filter-row">
          <div class="filter-item">
            <label for="activityIdFilter">ID</label>
            <input type="number" id="activityIdFilter" v-model="activityFilters.id" placeholder="请输入ID">
          </div>
          <div class="filter-item">
            <label for="activityNameFilter">活动名称</label>
            <input type="text" id="activityNameFilter" v-model="activityFilters.name" placeholder="请输入活动名称">
          </div>
          <div class="filter-item">
            <label for="activityTemplateFilter">活动模板</label>
            <select id="activityTemplateFilter" v-model="activityFilters.template_id">
              <option value="">全部</option>
              <option v-for="t in activityTemplates" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div class="filter-item">
            <label for="activityStatusFilter">状态</label>
            <select id="activityStatusFilter" v-model="activityFilters.status">
              <option value="">全部</option>
              <option value="0">启用</option>
              <option value="1">禁用</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button class="search-btn" @click="searchActivities">搜索</button>
          <button class="reset-btn" @click="resetActivityFilters">重置</button>
        </div>
      </div>

      <!-- 活动列表 -->
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>活动名称</th>
            <th>关联模板</th>
            <th>活动类型</th>
            <th>开始时间</th>
            <th>结束时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!paginatedActivities || paginatedActivities.length === 0">
            <td colspan="8" style="text-align: center; padding: 40px;">暂无数据</td>
          </tr>
          <tr v-for="activity in paginatedActivities" :key="activity.id" v-else>
            <td>{{ activity.id }}</td>
            <td>{{ activity.name }}</td>
            <td>{{ activity.template_name }}</td>
            <td>{{ getActivityTypeText(activity.template_type) }}</td>
            <td>{{ formatDateTime(activity.start_time) }}</td>
            <td>{{ formatDateTime(activity.end_time) }}</td>
            <td>{{ activity.status === 0 ? '启用' : '禁用' }}</td>
            <td class="action-column">
              <button class="edit-btn" @click="openActivityDetailDrawer(activity)">详情</button>
              <button v-if="hasPermission('edit_activity') && activity.status === 1" class="edit-btn" @click="openEditActivityDrawer(activity)">编辑</button>
              <button v-if="hasPermission('enable_activity') && activity.status === 1" class="enable-btn" @click="handleUpdateActivityStatus(activity.id, 0)">启用</button>
              <button v-if="hasPermission('disable_activity') && activity.status === 0" class="disable-btn" @click="handleUpdateActivityStatus(activity.id, 1)">禁用</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <Pagination
        :current-page="activityCurrentPage"
        :total-pages="activityTotalPages"
        @page-change="handleActivityPageChange"
      />
    </div>

    <!-- 新增活动抽屉 -->
    <Drawer :show="showAddActivityDrawer" @close="closeAddActivityDrawer" @confirm="saveAddActivity" title="新增活动">
      <div class="form-group">
        <label for="addActivityName">活动名称 <span class="required">*</span></label>
        <input type="text" id="addActivityName" v-model="addActivityData.name" placeholder="请输入活动名称" required>
      </div>
      <div class="form-group-row" style="display: flex; gap: 15px;">
        <div class="form-group-col" style="flex: 1;">
          <label for="addActivityTemplate">活动模板 <span class="required">*</span></label>
          <select id="addActivityTemplate" v-model="addActivityData.template_id" @change="onActivityTemplateChange" required>
            <option value="">请选择活动模板</option>
            <option v-for="t in activeActivityTemplates" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <div class="form-group-col" style="flex: 1;">
          <label>模板类型</label>
          <input type="text" :value="getActivityTypeText(addActivityData.template_type)" readonly class="readonly-input">
        </div>
        <div class="form-group-col" style="flex: 1;">
          <label>选择方式</label>
          <input type="text" :value="addActivityData.template_select_type == 1 ? '按类型' : (addActivityData.template_select_type == 2 ? '按商品' : '')" readonly class="readonly-input">
        </div>
      </div>
      <!-- 模板包含的商品展示 -->
      <div class="form-group" v-if="addActivityData.template_id && (addActivityData.template_select_type == 1 || addActivityData.template_select_type == 2) && activityTemplateGoods.length > 0">
        <label>模板包含商品（共 {{ activityTemplateGoods.length }} 条）</label>
        <table class="included-goods-table">
          <thead>
            <tr>
              <th>商品ID</th>
              <th>商品名称</th>
              <th>标准售价</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="goods in paginatedActivityTemplateGoods" :key="goods.id">
              <td>{{ goods.id }}</td>
              <td>{{ goods.name }}</td>
              <td>{{ goods.price }}</td>
            </tr>
          </tbody>
        </table>
        <Pagination
          v-if="activityTemplateGoodsTotalPages > 1"
          :current-page="activityTemplateGoodsCurrentPage"
          :total-pages="activityTemplateGoodsTotalPages"
          @page-change="handleActivityTemplateGoodsPageChange"
          style="margin-top: 10px;"
        />
      </div>
      <div class="form-group-row">
        <div class="form-group-col">
          <label for="addActivityStartTime">开始时间 <span class="required">*</span></label>
          <input type="datetime-local" id="addActivityStartTime" v-model="addActivityData.start_time" required>
        </div>
        <div class="form-group-col">
          <label for="addActivityEndTime">结束时间 <span class="required">*</span></label>
          <input type="datetime-local" id="addActivityEndTime" v-model="addActivityData.end_time" required>
        </div>
      </div>
      <!-- 满折规则表格 -->
      <div class="form-group" v-if="addActivityData.template_type == 2">
        <label>优惠规则 <span class="required">*</span></label>
        <table class="included-goods-table" v-if="addActivityData.details.length > 0">
          <thead>
            <tr>
              <th>数量</th>
              <th>折扣(折)</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(detail, index) in addActivityData.details" :key="index">
              <td><input type="number" v-model="detail.threshold_amount" step="1" min="1" style="width:100px;"></td>
              <td><input type="number" v-model="detail.discount_value" step="0.01" min="0" max="10" style="width:100px;"></td>
              <td>
                <button type="button" class="delete-btn" @click="removeActivityDetail(index)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="add-included-btn" @click="addActivityDetail">+ 新增规则</button>
      </div>
    </Drawer>

    <!-- 编辑活动抽屉 -->
    <Drawer :show="showEditActivityDrawer" @close="closeEditActivityDrawer" @confirm="saveEditActivity" title="编辑活动">
      <div class="form-group">
        <label for="editActivityName">活动名称 <span class="required">*</span></label>
        <input type="text" id="editActivityName" v-model="editActivityData.name" placeholder="请输入活动名称" required>
      </div>
      <div class="form-group">
        <label for="editActivityTemplate">活动模板 <span class="required">*</span></label>
        <select id="editActivityTemplate" v-model="editActivityData.template_id" @change="onEditActivityTemplateChange" required>
          <option value="">请选择活动模板</option>
          <option v-for="t in activeActivityTemplates" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
      </div>
      <div class="form-group-row">
        <div class="form-group-col">
          <label>模板类型</label>
          <input type="text" :value="getActivityTypeText(editActivityData.template_type)" readonly class="readonly-input">
        </div>
        <div class="form-group-col">
          <label>选择方式</label>
          <input type="text" :value="editActivityData.template_select_type == 1 ? '按类型' : (editActivityData.template_select_type == 2 ? '按商品' : '')" readonly class="readonly-input">
        </div>
      </div>
      <!-- 模板包含的商品展示 -->
      <div class="form-group" v-if="editActivityData.template_id && editActivityTemplateGoods.length > 0">
        <label>模板包含商品</label>
        <table class="included-goods-table">
          <thead>
            <tr>
              <th>商品ID</th>
              <th>商品名称</th>
              <th>标准售价</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="goods in editActivityTemplateGoods" :key="goods.id">
              <td>{{ goods.id }}</td>
              <td>{{ goods.name }}</td>
              <td>{{ goods.price }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="form-group-row">
        <div class="form-group-col">
          <label for="editActivityStartTime">开始时间 <span class="required">*</span></label>
          <input type="datetime-local" id="editActivityStartTime" v-model="editActivityData.start_time" required>
        </div>
        <div class="form-group-col">
          <label for="editActivityEndTime">结束时间 <span class="required">*</span></label>
          <input type="datetime-local" id="editActivityEndTime" v-model="editActivityData.end_time" required>
        </div>
      </div>
      <!-- 满折规则表格 -->
      <div class="form-group" v-if="editActivityData.template_type == 2">
        <label>优惠规则 <span class="required">*</span></label>
        <table class="included-goods-table" v-if="editActivityData.details.length > 0">
          <thead>
            <tr>
              <th>数量</th>
              <th>折扣(折)</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(detail, index) in editActivityData.details" :key="index">
              <td><input type="number" v-model="detail.threshold_amount" step="1" min="1" style="width:100px;"></td>
              <td><input type="number" v-model="detail.discount_value" step="0.01" min="0" max="10" style="width:100px;"></td>
              <td>
                <button type="button" class="delete-btn" @click="removeEditActivityDetail(index)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="add-included-btn" @click="addEditActivityDetail">+ 新增规则</button>
      </div>
    </Drawer>

    <!-- 活动详情抽屉 -->
    <Drawer :show="showActivityDetailDrawer" @close="closeActivityDetailDrawer" title="活动详情" :showConfirm="false" cancelText="关闭">
      <div class="form-group">
        <label>活动ID</label>
        <input type="text" :value="activityDetailData.id" readonly class="readonly-input">
      </div>
      <div class="form-group">
        <label>活动名称</label>
        <input type="text" :value="activityDetailData.name" readonly class="readonly-input">
      </div>
      <div class="form-group-row" style="display: flex; gap: 15px;">
        <div class="form-group-col" style="flex: 1;">
          <label>活动模板</label>
          <input type="text" :value="activityDetailData.template_name" readonly class="readonly-input">
        </div>
        <div class="form-group-col" style="flex: 1;">
          <label>模板类型</label>
          <input type="text" :value="getActivityTypeText(activityDetailData.template_type)" readonly class="readonly-input">
        </div>
        <div class="form-group-col" style="flex: 1;">
          <label>选择方式</label>
          <input type="text" :value="activityDetailData.template_select_type == 1 ? '按类型' : '按商品'" readonly class="readonly-input">
        </div>
      </div>
      <!-- 商品列表 -->
      <div class="form-group" v-if="activityDetailData.goods && activityDetailData.goods.length > 0">
        <label>模板包含商品（共 {{ activityDetailData.goods.length }} 条）<span v-if="activityDetailData.template_select_type == 1" style="color: #666; font-weight: normal;">（按类型关联）</span></label>
        <table class="included-goods-table">
          <thead>
            <tr>
              <th>商品ID</th>
              <th>商品名称</th>
              <th>标准售价</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="goods in paginatedActivityDetailGoods" :key="goods.id">
              <td>{{ goods.id }}</td>
              <td>{{ goods.name }}</td>
              <td>{{ goods.price }}</td>
            </tr>
          </tbody>
        </table>
        <Pagination
          v-if="activityDetailGoodsTotalPages > 1"
          :current-page="activityDetailGoodsCurrentPage"
          :total-pages="activityDetailGoodsTotalPages"
          @page-change="handleActivityDetailGoodsPageChange"
          style="margin-top: 10px;"
        />
      </div>
      <div class="form-group-row">
        <div class="form-group-col">
          <label>开始时间</label>
          <input type="text" :value="activityDetailData.start_time" readonly class="readonly-input">
        </div>
        <div class="form-group-col">
          <label>结束时间</label>
          <input type="text" :value="activityDetailData.end_time" readonly class="readonly-input">
        </div>
      </div>
      <div class="form-group">
        <label>状态</label>
        <input type="text" :value="activityDetailData.status === 0 ? '启用' : '禁用'" readonly class="readonly-input">
      </div>
      <!-- 满折规则表格 -->
      <div class="form-group" v-if="activityDetailData.template_type == 2 && activityDetailData.details.length > 0">
        <label>优惠规则</label>
        <table class="included-goods-table">
          <thead>
            <tr>
              <th>数量</th>
              <th>折扣(折)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(detail, index) in activityDetailData.details" :key="index">
              <td>{{ detail.threshold_amount }}</td>
              <td>{{ detail.discount_value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Drawer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'
import Drawer from '@/components/common/Drawer.vue'
import Loading from '@/components/common/Loading.vue'
import Pagination from '@/components/common/Pagination.vue'
import {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  updateActivityStatus
} from '@/api/activity'
import {
  getActivityTemplates,
  getActiveActivityTemplates,
  getActivityTemplate
} from '@/api/activity_template'
import { getGoods } from '@/api/goods'

export default {
  name: 'ActivityManagement',
  components: {
    Drawer,
    Loading,
    Pagination
  },
  setup() {
    const permissionStore = usePermissionStore()
    const mounted = ref(false)
    const loading = ref(false)

    // 活动列表相关
    const activityList = ref([])
    const filteredActivityList = ref([])
    const activityFilters = ref({
      id: '',
      name: '',
      template_id: '',
      status: ''
    })
    const activityCurrentPage = ref(1)
    const activityPageSize = ref(10)

    // 活动模板列表
    const activityTemplates = ref([])
    const activeActivityTemplates = ref([])

    // 新增活动相关
    const showAddActivityDrawer = ref(false)
    const addActivityData = ref({
      name: '',
      template_id: '',
      template_type: '',
      template_select_type: '',
      start_time: '',
      end_time: '',
      status: 1,
      details: []
    })
    const activityTemplateGoods = ref([])
    const activityTemplateGoodsCurrentPage = ref(1)
    const activityTemplateGoodsPageSize = ref(10)

    // 编辑活动相关
    const showEditActivityDrawer = ref(false)
    const editActivityData = ref({
      id: null,
      name: '',
      template_id: '',
      template_type: '',
      template_select_type: '',
      start_time: '',
      end_time: '',
      status: 1,
      details: []
    })
    const editActivityTemplateGoods = ref([])

    // 活动详情相关
    const showActivityDetailDrawer = ref(false)
    const activityDetailData = ref({
      id: null,
      name: '',
      template_id: '',
      template_name: '',
      template_type: '',
      template_select_type: '',
      start_time: '',
      end_time: '',
      status: 0,
      details: [],
      goods: []
    })
    const activityDetailGoodsCurrentPage = ref(1)
    const activityDetailGoodsPageSize = ref(10)

    // 计算属性
    const filteredActivities = computed(() => {
      return filteredActivityList.value
    })

    const activityTotalPages = computed(() => {
      return Math.ceil(filteredActivities.value.length / activityPageSize.value) || 1
    })

    const paginatedActivities = computed(() => {
      const start = (activityCurrentPage.value - 1) * activityPageSize.value
      const end = start + activityPageSize.value
      return filteredActivities.value.slice(start, end)
    })

    const activityTemplateGoodsTotalPages = computed(() => {
      return Math.ceil(activityTemplateGoods.value.length / activityTemplateGoodsPageSize.value) || 1
    })

    const paginatedActivityTemplateGoods = computed(() => {
      const start = (activityTemplateGoodsCurrentPage.value - 1) * activityTemplateGoodsPageSize.value
      const end = start + activityTemplateGoodsPageSize.value
      return activityTemplateGoods.value.slice(start, end)
    })

    const activityDetailGoodsTotalPages = computed(() => {
      return Math.ceil((activityDetailData.value.goods?.length || 0) / activityDetailGoodsPageSize.value) || 1
    })

    const paginatedActivityDetailGoods = computed(() => {
      const start = (activityDetailGoodsCurrentPage.value - 1) * activityDetailGoodsPageSize.value
      const end = start + activityDetailGoodsPageSize.value
      return activityDetailData.value.goods?.slice(start, end) || []
    })

    // 权限检查
    const hasPermission = (permission) => {
      return permissionStore.hasPermission(permission)
    }

    // 工具函数
    const getActivityTypeText = (type) => {
      const typeMap = {
        0: '满减',
        1: '满赠',
        2: '满折'
      }
      return typeMap[type] || ''
    }

    const formatDateTime = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 活动列表方法
    const fetchActivities = async () => {
      loading.value = true
      try {
        const response = await getActivities()
        const data = response.data?.activities || response.data
        activityList.value = Array.isArray(data) ? data : []
        filteredActivityList.value = activityList.value
      } catch (error) {
        console.error('获取活动列表失败:', error)
        activityList.value = []
        filteredActivityList.value = []
        alert('获取活动列表失败')
      } finally {
        loading.value = false
      }
    }

    const searchActivities = () => {
      filteredActivityList.value = activityList.value.filter(activity => {
        if (activityFilters.value.id && activity.id != activityFilters.value.id) {
          return false
        }
        if (activityFilters.value.name && !activity.name.includes(activityFilters.value.name)) {
          return false
        }
        if (activityFilters.value.template_id && activity.template_id != activityFilters.value.template_id) {
          return false
        }
        if (activityFilters.value.status !== '' && activity.status != activityFilters.value.status) {
          return false
        }
        return true
      })
      activityCurrentPage.value = 1
    }

    const resetActivityFilters = () => {
      activityFilters.value = {
        id: '',
        name: '',
        template_id: '',
        status: ''
      }
      filteredActivityList.value = activityList.value
      activityCurrentPage.value = 1
    }

    const handleActivityPageChange = (page) => {
      activityCurrentPage.value = page
    }

    // 活动模板方法
    const fetchActivityTemplates = async () => {
      try {
        const response = await getActivityTemplates()
        const data = response.data?.templates || response.data?.activity_templates || response.data
        activityTemplates.value = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('获取活动模板列表失败:', error)
        activityTemplates.value = []
      }
    }

    const fetchActiveActivityTemplates = async () => {
      try {
        const response = await getActiveActivityTemplates()
        const data = response.data?.templates || response.data?.activity_templates || response.data
        activeActivityTemplates.value = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('获取启用的活动模板列表失败:', error)
        activeActivityTemplates.value = []
      }
    }

    // 加载模板包含的商品
    const loadTemplateGoods = async (templateId, mode) => {
      try {
        const response = await getActivityTemplate(templateId)
        const template = response.data?.template || response.data
        let goods = []

        if (template.select_type == 1) {
          // 按类型选择，加载所有关联类型下的商品
          const classifyList = template.classify_list || []
          for (const classify of classifyList) {
            const goodsResponse = await getGoods({ classifyid: classify.classify_id, status: 0 })
            goods = goods.concat(goodsResponse.data?.goods || goodsResponse.data || [])
          }
        } else {
          // 按商品选择，使用模板关联的商品
          const goodsList = template.goods_list || []
          goods = goodsList.map(g => ({
            id: g.goods_id,
            name: g.goods_name,
            price: g.price,
            brand_name: g.brand_name,
            classify_name: g.classify_name
          }))
        }

        if (mode === 'add') {
          activityTemplateGoods.value = goods
          activityTemplateGoodsCurrentPage.value = 1
        } else {
          editActivityTemplateGoods.value = goods
        }
      } catch (error) {
        console.error('获取模板商品失败:', error)
        if (mode === 'add') {
          activityTemplateGoods.value = []
        } else {
          editActivityTemplateGoods.value = []
        }
      }
    }

    // 新增活动方法
    const openAddActivityDrawer = async () => {
      addActivityData.value = {
        name: '',
        template_id: '',
        template_type: '',
        template_select_type: '',
        start_time: '',
        end_time: '',
        status: 1,
        details: []
      }
      activityTemplateGoods.value = []
      await fetchActiveActivityTemplates()
      showAddActivityDrawer.value = true
    }

    const closeAddActivityDrawer = () => {
      showAddActivityDrawer.value = false
    }

    const onActivityTemplateChange = async () => {
      const template = activeActivityTemplates.value.find(t => t.id == addActivityData.value.template_id)
      if (template) {
        addActivityData.value.template_type = template.type
        addActivityData.value.template_select_type = template.select_type
        await loadTemplateGoods(template.id, 'add')
      } else {
        addActivityData.value.template_type = ''
        addActivityData.value.template_select_type = ''
        activityTemplateGoods.value = []
      }
    }

    const addActivityDetail = () => {
      addActivityData.value.details.push({ threshold_amount: 0, discount_value: 0 })
    }

    const removeActivityDetail = (index) => {
      addActivityData.value.details.splice(index, 1)
    }

    const saveAddActivity = async () => {
      if (!addActivityData.value.name || !addActivityData.value.template_id || !addActivityData.value.start_time || !addActivityData.value.end_time) {
        alert('请填写必填项')
        return
      }
      if (addActivityData.value.template_type == 2 && addActivityData.value.details.length === 0) {
        alert('满折类型活动需要至少添加一条优惠规则')
        return
      }
      loading.value = true
      try {
        const postData = {
          name: addActivityData.value.name,
          template_id: parseInt(addActivityData.value.template_id),
          start_time: addActivityData.value.start_time,
          end_time: addActivityData.value.end_time,
          status: parseInt(addActivityData.value.status),
          details: addActivityData.value.details
        }
        await createActivity(postData)
        await fetchActivities()
        closeAddActivityDrawer()
        alert('活动创建成功')
      } catch (error) {
        console.error('创建活动失败:', error)
        alert(error.response?.data?.error || '创建活动失败')
      } finally {
        loading.value = false
      }
    }

    const handleActivityTemplateGoodsPageChange = (page) => {
      activityTemplateGoodsCurrentPage.value = page
    }

    // 编辑活动方法
    const openEditActivityDrawer = async (activity) => {
      try {
        await fetchActiveActivityTemplates()
        const response = await getActivity(activity.id)
        const data = response.data?.activity || response.data

        // 格式化日期时间为input[type=datetime-local]格式
        const formatDateForInput = (dateStr) => {
          if (!dateStr) return ''
          const date = new Date(dateStr)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          return `${year}-${month}-${day}T${hours}:${minutes}`
        }

        editActivityData.value = {
          id: data.id,
          name: data.name,
          template_id: data.template_id,
          template_type: data.template_type,
          template_select_type: data.select_type,
          start_time: formatDateForInput(data.start_time),
          end_time: formatDateForInput(data.end_time),
          status: data.status,
          details: data.details || []
        }

        if (data.template_id) {
          await loadTemplateGoods(data.template_id, 'edit')
        }
        showEditActivityDrawer.value = true
      } catch (error) {
        console.error('获取活动详情失败:', error)
        alert('获取活动详情失败')
      }
    }

    const closeEditActivityDrawer = () => {
      showEditActivityDrawer.value = false
    }

    const onEditActivityTemplateChange = async () => {
      const template = activeActivityTemplates.value.find(t => t.id == editActivityData.value.template_id)
      if (template) {
        editActivityData.value.template_type = template.type
        editActivityData.value.template_select_type = template.select_type
        await loadTemplateGoods(template.id, 'edit')
      } else {
        editActivityData.value.template_type = ''
        editActivityData.value.template_select_type = ''
        editActivityTemplateGoods.value = []
      }
    }

    const addEditActivityDetail = () => {
      editActivityData.value.details.push({ threshold_amount: 0, discount_value: 0 })
    }

    const removeEditActivityDetail = (index) => {
      editActivityData.value.details.splice(index, 1)
    }

    const saveEditActivity = async () => {
      if (!editActivityData.value.name || !editActivityData.value.template_id || !editActivityData.value.start_time || !editActivityData.value.end_time) {
        alert('请填写必填项')
        return
      }
      if (editActivityData.value.template_type == 2 && editActivityData.value.details.length === 0) {
        alert('满折类型活动需要至少添加一条优惠规则')
        return
      }
      loading.value = true
      try {
        const putData = {
          name: editActivityData.value.name,
          template_id: parseInt(editActivityData.value.template_id),
          start_time: editActivityData.value.start_time,
          end_time: editActivityData.value.end_time,
          status: parseInt(editActivityData.value.status),
          details: editActivityData.value.details
        }
        await updateActivity(editActivityData.value.id, putData)
        await fetchActivities()
        closeEditActivityDrawer()
        alert('活动更新成功')
      } catch (error) {
        console.error('更新活动失败:', error)
        alert(error.response?.data?.error || '更新活动失败')
      } finally {
        loading.value = false
      }
    }

    // 活动详情方法
    const openActivityDetailDrawer = async (activity) => {
      try {
        await fetchActiveActivityTemplates()
        const response = await getActivity(activity.id)
        const data = response.data?.activity || response.data

        // 加载模板包含的商品
        let goods = []
        if (data.template_id) {
          const templateResponse = await getActivityTemplate(data.template_id)
          const template = templateResponse.data?.template || templateResponse.data

          if (template.select_type == 1) {
            const classifyList = template.classify_list || []
            for (const classify of classifyList) {
              const goodsResponse = await getGoods({ classifyid: classify.classify_id, status: 0 })
              goods = goods.concat(goodsResponse.data?.goods || goodsResponse.data || [])
            }
          } else {
            const goodsList = template.goods_list || []
            goods = goodsList.map(g => ({
              id: g.goods_id,
              name: g.goods_name,
              price: g.price
            }))
          }
        }

        // 格式化日期时间
        const formatDateForDisplay = (dateStr) => {
          if (!dateStr) return ''
          return new Date(dateStr).toLocaleString('zh-CN')
        }

        activityDetailData.value = {
          id: data.id,
          name: data.name,
          template_id: data.template_id,
          template_name: data.template_name,
          template_type: data.template_type,
          template_select_type: data.select_type,
          start_time: formatDateForDisplay(data.start_time),
          end_time: formatDateForDisplay(data.end_time),
          status: data.status,
          details: data.details || [],
          goods: goods
        }
        activityDetailGoodsCurrentPage.value = 1
        showActivityDetailDrawer.value = true
      } catch (error) {
        console.error('获取活动详情失败:', error)
        alert('获取活动详情失败')
      }
    }

    const closeActivityDetailDrawer = () => {
      showActivityDetailDrawer.value = false
    }

    const handleActivityDetailGoodsPageChange = (page) => {
      activityDetailGoodsCurrentPage.value = page
    }

    // 更新活动状态
    const handleUpdateActivityStatus = async (id, status) => {
      loading.value = true
      try {
        await updateActivityStatus(id, status)
        await fetchActivities()
        alert(status === 0 ? '已启用' : '已禁用')
      } catch (error) {
        console.error('更新状态失败:', error)
        alert(error.response?.data?.error || '更新状态失败')
      } finally {
        loading.value = false
      }
    }

    // 初始化
    onMounted(async () => {
      loading.value = true
      try {
        await Promise.all([
          fetchActivities(),
          fetchActivityTemplates()
        ])
      } finally {
        mounted.value = true
        loading.value = false
      }
    })

    return {
      mounted,
      loading,
      // 活动列表
      activityList,
      activityFilters,
      activityCurrentPage,
      activityTotalPages,
      paginatedActivities,
      activityTemplates,
      activeActivityTemplates,
      fetchActivities,
      searchActivities,
      resetActivityFilters,
      handleActivityPageChange,
      // 新增活动
      showAddActivityDrawer,
      addActivityData,
      activityTemplateGoods,
      activityTemplateGoodsCurrentPage,
      activityTemplateGoodsTotalPages,
      paginatedActivityTemplateGoods,
      openAddActivityDrawer,
      closeAddActivityDrawer,
      onActivityTemplateChange,
      addActivityDetail,
      removeActivityDetail,
      saveAddActivity,
      handleActivityTemplateGoodsPageChange,
      // 编辑活动
      showEditActivityDrawer,
      editActivityData,
      editActivityTemplateGoods,
      openEditActivityDrawer,
      closeEditActivityDrawer,
      onEditActivityTemplateChange,
      addEditActivityDetail,
      removeEditActivityDetail,
      saveEditActivity,
      // 活动详情
      showActivityDetailDrawer,
      activityDetailData,
      activityDetailGoodsCurrentPage,
      activityDetailGoodsTotalPages,
      paginatedActivityDetailGoods,
      openActivityDetailDrawer,
      closeActivityDetailDrawer,
      handleActivityDetailGoodsPageChange,
      // 状态更新
      handleUpdateActivityStatus,
      // 工具函数
      hasPermission,
      getActivityTypeText,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.required {
  color: #ff4d4f;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.readonly-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #666;
}

.form-group-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.form-group-col {
  flex: 1;
  text-align: left;
}

.form-group-col label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group-col input,
.form-group-col select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.included-goods-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.included-goods-table th,
.included-goods-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.included-goods-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.included-goods-table input {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-included-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.add-included-btn:hover {
  background-color: #45a049;
}

.delete-btn {
  padding: 4px 12px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn:hover {
  background-color: #da190b;
}
</style>
