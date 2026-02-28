<template>
  <div class="page-container" style="position: relative;">
    <!-- Loading遮罩层 -->
    <Loading :show="loading" text="加载中..." />

    <div v-if="mounted">
      <div class="page-header">
        <h1>订单管理</h1>
        <button v-if="hasPermission('add_order')" class="add-btn" @click="openAddOrderDrawer">新增订单</button>
      </div>

      <!-- 筛选表单 -->
      <div class="filter-form">
        <div class="filter-row">
          <div class="filter-item">
            <label for="orderIdFilter">ID</label>
            <input type="number" id="orderIdFilter" v-model="filters.id" placeholder="请输入ID">
          </div>
          <div class="filter-item">
            <label for="orderUidFilter">UID</label>
            <input type="number" id="orderUidFilter" v-model="filters.uid" placeholder="请输入UID">
          </div>
          <div class="filter-item">
            <label for="orderStatusFilter">状态</label>
            <select id="orderStatusFilter" v-model="filters.status">
              <option value="">全部</option>
              <option value="10">草稿</option>
              <option value="20">未支付</option>
              <option value="30">部分支付</option>
              <option value="40">已支付</option>
              <option value="50">退费中</option>
              <option value="99">已作废</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button class="search-btn" @click="searchOrders">搜索</button>
          <button class="reset-btn" @click="resetFilters">重置</button>
        </div>
      </div>

      <!-- 订单列表 -->
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>UID</th>
            <th>下单时间</th>
            <th>姓名</th>
            <th>应收金额</th>
            <th>优惠金额</th>
            <th>实收金额</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in paginatedOrders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.uid }}</td>
            <td>{{ order.create_time }}</td>
            <td>{{ order.student_name }}</td>
            <td>{{ order.amount_receivable }}</td>
            <td style="color: #e74c3c;">{{ order.discount_amount || '0.00' }}</td>
            <td style="font-weight: bold;">{{ order.amount_received }}</td>
            <td>{{ getOrderStatusText(order.status) }}</td>
            <td class="action-column">
              <button
                v-if="hasPermission('edit_order') && order.status === 10"
                class="edit-btn"
                @click="openEditOrderDrawer(order)"
              >编辑</button>
              <button
                v-if="hasPermission('void_order') && order.status === 10"
                class="delete-btn"
                @click="cancelOrder(order.id)"
              >作废</button>
              <button
                v-if="[20, 30, 40, 50].includes(order.status)"
                class="view-btn"
                @click="openOrderDetailDrawer(order)"
              >详情</button>
              <button
                v-if="hasPermission('apply_refund') && (order.status === 30 || order.status === 40)"
                class="refund-btn"
                @click="openRefundDialog(order.id)"
              >申请退费</button>
            </td>
          </tr>
          <tr v-if="paginatedOrders.length === 0">
            <td colspan="9" style="text-align: center; padding: 40px;">暂无数据</td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @change="currentPage = $event"
      />
    </div>

    <!-- 新增/编辑订单抽屉 -->
    <div class="drawer-overlay" v-if="showAddOrderDrawer" @click="closeAddOrderDrawer">
      <div class="drawer" @click.stop>
        <div class="drawer-header">
          <h3>{{ isEditMode ? '编辑订单' : '新增订单' }}</h3>
          <button class="close-btn" @click="closeAddOrderDrawer">&times;</button>
        </div>
        <div class="drawer-body">
          <div class="form-group-row">
            <div class="form-group-col">
              <label>学生姓名</label>
              <input
                v-if="isEditMode"
                type="text"
                :value="addOrderData.student_name"
                readonly
                class="readonly-input"
              >
              <select
                v-else
                id="addOrderStudentName"
                v-model="addOrderData.student_id"
                @change="onOrderStudentChange"
                class="styled-select"
                required
              >
                <option value="">请选择学生</option>
                <option v-for="student in activeStudentsForOrder" :key="student.id" :value="student.id">
                  {{ student.student_name }}
                </option>
              </select>
            </div>
            <div class="form-group-col">
              <label>UID</label>
              <input
                type="text"
                :value="addOrderData.student_id || '选择学生后自动显示'"
                readonly
                class="readonly-input"
              >
            </div>
          </div>

          <div class="form-group-row">
            <div class="form-group-col">
              <label for="addOrderExpectedPaymentTime">预计付款时间</label>
              <input
                type="date"
                id="addOrderExpectedPaymentTime"
                v-model="addOrderData.expected_payment_time"
              >
            </div>
            <div class="form-group-col">
              <label>参加活动</label>
              <input
                type="text"
                :value="addOrderData.participating_activities || '无'"
                readonly
                class="readonly-input"
                :style="{color: addOrderData.participating_activities ? '#333' : '#999'}"
              >
            </div>
          </div>

          <div class="form-group-row">
            <div class="form-group-col">
              <label>应收金额</label>
              <input
                type="text"
                :value="orderTotalReceivable.toFixed(2)"
                readonly
                class="readonly-input"
              >
            </div>
            <div class="form-group-col">
              <label>优惠金额</label>
              <input
                type="text"
                :value="orderDiscountAmount.toFixed(2)"
                readonly
                class="readonly-input"
                style="color: #e74c3c; font-weight: bold;"
              >
            </div>
            <div class="form-group-col">
              <label>实收金额</label>
              <input
                type="text"
                :value="orderTotalReceived.toFixed(2)"
                readonly
                class="readonly-input"
                style="color: #27ae60; font-weight: bold;"
              >
            </div>
          </div>

          <div class="form-group">
            <label>选择商品 <span class="required">*</span></label>
            <table class="included-goods-table" v-if="selectedOrderGoods.length > 0">
              <thead>
                <tr>
                  <th>商品ID</th>
                  <th>商品名称</th>
                  <th>标准售价</th>
                  <th>商品总价</th>
                  <th>优惠金额</th>
                  <th>优惠后金额</th>
                  <th>组合售卖</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(goods, index) in selectedOrderGoods" :key="goods.goods_id">
                  <td>{{ goods.goods_id }}</td>
                  <td>{{ goods.name }}</td>
                  <td>{{ goods.price }}</td>
                  <td>{{ goods.total_price }}</td>
                  <td>{{ goods.discount_amount || 0 }}</td>
                  <td>{{ (goods.total_price - (goods.discount_amount || 0)).toFixed(2) }}</td>
                  <td>{{ goods.isgroup == 0 ? '是' : '否' }}</td>
                  <td>
                    <button type="button" class="delete-btn" @click="removeOrderGoods(index)">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <button type="button" class="add-included-btn" @click="openAddOrderGoodsModal">+ 新增商品</button>
          </div>
        </div>
        <div class="drawer-footer">
          <button class="cancel-btn" @click="closeAddOrderDrawer">取消</button>
          <button class="save-btn" @click="saveAddOrder">保存</button>
        </div>
      </div>
    </div>

    <!-- 新增订单商品子弹窗 -->
    <div class="modal-overlay" v-if="showAddOrderGoodsModal">
      <div class="modal">
        <div class="modal-header">
          <h3>新增商品</h3>
          <button class="close-btn" @click="closeAddOrderGoodsModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="orderGoodsName">商品名称 <span class="required">*</span></label>
            <select
              id="orderGoodsName"
              v-model="addOrderGoodsData.goods_id"
              @change="onOrderGoodsChange"
              class="styled-select"
              required
            >
              <option value="">请选择商品</option>
              <option v-for="goods in availableGoodsForOrderSelection" :key="goods.id" :value="goods.id">
                {{ goods.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>品牌</label>
            <input type="text" v-model="addOrderGoodsData.brand_name" readonly class="readonly-input">
          </div>
          <div class="form-group">
            <label>类型</label>
            <input type="text" v-model="addOrderGoodsData.classify_name" readonly class="readonly-input">
          </div>
          <div class="form-group">
            <label>属性+属性值</label>
            <input type="text" v-model="addOrderGoodsData.attributes" readonly class="readonly-input">
          </div>
          <div class="form-group">
            <label>标准售价</label>
            <input type="text" v-model="addOrderGoodsData.price" readonly class="readonly-input">
          </div>
          <div class="form-group">
            <label>商品总价</label>
            <input type="text" v-model="addOrderGoodsData.total_price" readonly class="readonly-input">
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeAddOrderGoodsModal">取消</button>
          <button class="save-btn" @click="saveOrderGoods">保存</button>
        </div>
      </div>
    </div>

    <!-- 订单详情抽屉 -->
    <div class="drawer-overlay" v-if="showOrderDetailDrawer" @click="closeOrderDetailDrawer">
      <div class="drawer" @click.stop>
        <div class="drawer-header">
          <h3>订单详情</h3>
          <button class="close-btn" @click="closeOrderDetailDrawer">&times;</button>
        </div>
        <div class="drawer-body">
          <div class="form-group-row">
            <div class="form-group-col">
              <label>学生姓名</label>
              <input type="text" :value="orderDetailData.student_name" readonly class="readonly-input">
            </div>
            <div class="form-group-col">
              <label>UID</label>
              <input type="text" :value="orderDetailData.uid" readonly class="readonly-input">
            </div>
          </div>

          <div class="form-group-row">
            <div class="form-group-col">
              <label>预计付款时间</label>
              <input type="text" :value="orderDetailData.expected_payment_time || '未设置'" readonly class="readonly-input">
            </div>
            <div class="form-group-col">
              <label>参加活动</label>
              <input type="text" :value="orderDetailData.participating_activities || '无'" readonly class="readonly-input" :style="{color: orderDetailData.participating_activities ? '#333' : '#999'}">
            </div>
          </div>

          <div class="form-group-row">
            <div class="form-group-col">
              <label>应收金额</label>
              <input type="text" :value="orderDetailData.amount_receivable" readonly class="readonly-input">
            </div>
            <div class="form-group-col">
              <label>优惠金额</label>
              <input type="text" :value="orderDetailData.discount_amount || '0.00'" readonly class="readonly-input" style="color: #e74c3c; font-weight: bold;">
            </div>
            <div class="form-group-col">
              <label>实收金额</label>
              <input type="text" :value="orderDetailData.amount_received" readonly class="readonly-input" style="color: #27ae60; font-weight: bold;">
            </div>
          </div>

          <div class="form-group">
            <label>选择商品</label>
            <table class="included-goods-table" v-if="orderDetailGoods.length > 0">
              <thead>
                <tr>
                  <th>商品ID</th>
                  <th>商品名称</th>
                  <th>标准售价</th>
                  <th>商品总价</th>
                  <th>优惠金额</th>
                  <th>优惠后金额</th>
                  <th>组合售卖</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="goods in orderDetailGoods" :key="goods.goods_id">
                  <td>{{ goods.goods_id }}</td>
                  <td>{{ goods.goods_name }}</td>
                  <td>{{ goods.price }}</td>
                  <td>{{ goods.amount_receivable }}</td>
                  <td>{{ goods.discount_amount || 0 }}</td>
                  <td>{{ (goods.amount_receivable - (goods.discount_amount || 0)).toFixed(2) }}</td>
                  <td>{{ goods.isgroup == 0 ? '是' : '否' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="drawer-footer">
          <button class="cancel-btn" @click="closeOrderDetailDrawer">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'
import Loading from '@/components/common/Loading.vue'
import Pagination from '@/components/common/Pagination.vue'
import {
  getOrders,
  createOrder,
  updateOrder,
  submitOrder as submitOrderApi,
  cancelOrder as cancelOrderApi,
  getOrderGoods
} from '@/api/order'
import { getActiveStudents } from '@/api/student'
import { getActiveGoodsForOrder } from '@/api/goods'

export default {
  name: 'OrderManagement',
  components: {
    Loading,
    Pagination
  },
  setup() {
    const permissionStore = usePermissionStore()
    const mounted = ref(false)
    const loading = ref(false)
    const orders = ref([])
    const activeStudentsForOrder = ref([])
    const availableGoodsForOrderSelection = ref([])

    // 筛选条件（用户输入）
    const filters = ref({
      id: '',
      uid: '',
      status: ''
    })

    // 实际应用的筛选条件（点击搜索后才生效）
    const activeFilters = ref({
      id: '',
      uid: '',
      status: ''
    })

    // 分页
    const currentPage = ref(1)
    const pageSize = 10

    // 抽屉和弹窗状态
    const showAddOrderDrawer = ref(false)
    const showAddOrderGoodsModal = ref(false)
    const showOrderDetailDrawer = ref(false)
    const isEditMode = ref(false)

    // 表单数据
    const addOrderData = ref({
      student_id: '',
      expected_payment_time: '',
      participating_activities: ''
    })

    const selectedOrderGoods = ref([])

    const addOrderGoodsData = ref({
      goods_id: '',
      name: '',
      brand_name: '',
      classify_name: '',
      attributes: '',
      price: 0,
      total_price: 0,
      isgroup: 1
    })

    const orderDetailData = ref({})
    const orderDetailGoods = ref([])

    // 订单状态映射
    const statusMap = {
      10: '草稿',
      20: '未支付',
      30: '部分支付',
      40: '已支付',
      50: '退费中',
      99: '已作废'
    }

    // 计算属性
    const orderTotalReceivable = computed(() => {
      return selectedOrderGoods.value.reduce((sum, goods) => sum + parseFloat(goods.total_price || 0), 0)
    })

    const orderDiscountAmount = computed(() => {
      return selectedOrderGoods.value.reduce((sum, goods) => sum + parseFloat(goods.discount_amount || 0), 0)
    })

    const orderTotalReceived = computed(() => {
      return orderTotalReceivable.value - orderDiscountAmount.value
    })

    // 权限检查
    const hasPermission = (perm) => permissionStore.hasPermission(perm)

    // 获取订单列表
    const fetchOrders = async () => {
      loading.value = true
      try {
        const response = await getOrders()
        console.log('订单API响应:', response)
        if (response.status === 200 && response.data && response.data.orders) {
          orders.value = response.data.orders
          console.log('订单数据已设置:', orders.value.length, '条')
        } else {
          console.log('响应码或数据为空:', response.status, response.data)
        }
      } catch (error) {
        console.error('获取订单列表失败:', error)
        alert('获取订单列表失败')
      } finally {
        loading.value = false
      }
    }

    // 筛选后的订单列表（使用activeFilters，只在点击搜索时才更新）
    const filteredOrders = computed(() => {
      return orders.value.filter(order => {
        if (activeFilters.value.id && order.id !== parseInt(activeFilters.value.id)) return false
        if (activeFilters.value.uid && order.uid !== parseInt(activeFilters.value.uid)) return false
        if (activeFilters.value.status && order.status !== parseInt(activeFilters.value.status)) return false
        return true
      })
    })

    // 分页后的数据
    const paginatedOrders = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      const end = start + pageSize
      const result = filteredOrders.value.slice(start, end)
      console.log('分页数据:', '总数=', filteredOrders.value.length, '当前页=', currentPage.value, '显示=', result.length)
      return result
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredOrders.value.length / pageSize)
    })

    // 搜索订单
    const searchOrders = () => {
      // 应用筛选条件
      activeFilters.value = { ...filters.value }
      // 重置到第一页
      currentPage.value = 1
    }

    // 重置筛选条件
    const resetFilters = () => {
      filters.value = {
        id: '',
        uid: '',
        status: ''
      }
      activeFilters.value = {
        id: '',
        uid: '',
        status: ''
      }
      currentPage.value = 1
    }

    // 打开新增订单抽屉
    const openAddOrderDrawer = async () => {
      isEditMode.value = false
      addOrderData.value = {
        student_id: '',
        expected_payment_time: '',
        participating_activities: ''
      }
      selectedOrderGoods.value = []
      showAddOrderDrawer.value = true

      // 加载学生和商品数据
      try {
        const [studentsRes, goodsRes] = await Promise.all([
          getActiveStudents(),
          getActiveGoodsForOrder()
        ])
        if (studentsRes.status === 200 && studentsRes.data) {
          activeStudentsForOrder.value = studentsRes.data.students || studentsRes.data
        }
        if (goodsRes.status === 200 && goodsRes.data) {
          availableGoodsForOrderSelection.value = goodsRes.data.goods || goodsRes.data
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    }

    // 打开编辑订单抽屉
    const openEditOrderDrawer = async (order) => {
      isEditMode.value = true
      addOrderData.value = {
        id: order.id,
        student_id: order.uid,
        student_name: order.student_name,
        expected_payment_time: order.expected_payment_time ? order.expected_payment_time.split('T')[0] : '',
        participating_activities: ''
      }

      showAddOrderDrawer.value = true

      // 加载数据
      try {
        const [studentsRes, goodsRes, orderGoodsRes] = await Promise.all([
          getActiveStudents(),
          getActiveGoodsForOrder(),
          getOrderGoods(order.id)
        ])
        if (studentsRes.status === 200 && studentsRes.data) {
          activeStudentsForOrder.value = studentsRes.data.students || studentsRes.data
        }
        if (goodsRes.status === 200 && goodsRes.data) {
          availableGoodsForOrderSelection.value = goodsRes.data.goods || goodsRes.data
        }
        if (orderGoodsRes.status === 200 && orderGoodsRes.data) {
          const goodsList = orderGoodsRes.data.goods || orderGoodsRes.data
          console.log('订单商品原始数据:', goodsList)
          selectedOrderGoods.value = goodsList.map(item => ({
            goods_id: item.goods_id || item.id,
            name: item.goods_name || item.name,
            price: item.price,
            total_price: item.amount_receivable || item.total_price,
            discount_amount: item.discount_amount || 0,
            isgroup: item.isgroup !== undefined ? item.isgroup : 1
          }))
          console.log('映射后的商品数据:', selectedOrderGoods.value)
        }
      } catch (error) {
        console.error('加载订单数据失败:', error)
      }
    }

    // 关闭新增订单抽屉
    const closeAddOrderDrawer = () => {
      showAddOrderDrawer.value = false
    }

    // 打开新增商品弹窗
    const openAddOrderGoodsModal = () => {
      addOrderGoodsData.value = {
        goods_id: '',
        name: '',
        brand_name: '',
        classify_name: '',
        attributes: '',
        price: 0,
        total_price: 0,
        isgroup: 1
      }
      showAddOrderGoodsModal.value = true
    }

    // 关闭新增商品弹窗
    const closeAddOrderGoodsModal = () => {
      showAddOrderGoodsModal.value = false
    }

    // 学生选择变化
    const onOrderStudentChange = () => {
      // 可以在这里加载该学生相关的活动等信息
    }

    // 商品选择变化
    const onOrderGoodsChange = () => {
      const selectedGoods = availableGoodsForOrderSelection.value.find(
        g => g.id === addOrderGoodsData.value.goods_id
      )
      if (selectedGoods) {
        addOrderGoodsData.value.name = selectedGoods.name
        addOrderGoodsData.value.brand_name = selectedGoods.brand_name || ''
        addOrderGoodsData.value.classify_name = selectedGoods.classify_name || ''
        addOrderGoodsData.value.attributes = selectedGoods.attributes || ''
        addOrderGoodsData.value.price = selectedGoods.price
        addOrderGoodsData.value.total_price = selectedGoods.total_price || selectedGoods.price
        addOrderGoodsData.value.isgroup = selectedGoods.isgroup
      }
    }

    // 保存商品
    const saveOrderGoods = () => {
      if (!addOrderGoodsData.value.goods_id) {
        alert('请选择商品')
        return
      }

      // 检查是否已添加
      if (selectedOrderGoods.value.some(g => g.goods_id === addOrderGoodsData.value.goods_id)) {
        alert('该商品已添加')
        return
      }

      selectedOrderGoods.value.push({
        goods_id: addOrderGoodsData.value.goods_id,
        name: addOrderGoodsData.value.name,
        brand_name: addOrderGoodsData.value.brand_name,
        classify_name: addOrderGoodsData.value.classify_name,
        attributes: addOrderGoodsData.value.attributes,
        price: addOrderGoodsData.value.price,
        total_price: addOrderGoodsData.value.total_price,
        discount_amount: 0,
        isgroup: addOrderGoodsData.value.isgroup
      })

      closeAddOrderGoodsModal()
    }

    // 删除商品
    const removeOrderGoods = (index) => {
      selectedOrderGoods.value.splice(index, 1)
    }

    // 保存订单
    const saveAddOrder = async () => {
      if (!addOrderData.value.student_id) {
        alert('请选择学生')
        return
      }
      if (selectedOrderGoods.value.length === 0) {
        alert('请至少添加一个商品')
        return
      }

      loading.value = true
      try {
        const data = {
          goods_list: selectedOrderGoods.value.map(g => ({
            goods_id: g.goods_id,
            price: g.price,
            total_price: g.total_price
          })),
          activity_ids: [],
          discount_amount: orderDiscountAmount.value,
          expected_payment_time: addOrderData.value.expected_payment_time || null,
          child_discounts: {}
        }

        // 只有新增订单时才需要student_id
        if (!isEditMode.value) {
          data.student_id = addOrderData.value.student_id
        }

        let response
        if (isEditMode.value) {
          response = await updateOrder(addOrderData.value.id, data)
        } else {
          response = await createOrder(data)
        }

        if (response.status === 200 || response.status === 201) {
          alert(isEditMode.value ? '订单更新成功' : '订单创建成功')
          closeAddOrderDrawer()
          await fetchOrders()
        } else {
          alert(response.data?.message || '操作失败')
        }
      } catch (error) {
        console.error('保存订单失败:', error)
        alert('保存订单失败: ' + (error.response?.data?.message || error.message))
      } finally {
        loading.value = false
      }
    }

    // 作废订单
    const cancelOrder = async (orderId) => {
      if (!confirm(`确定要作废订单 ${orderId} 吗？此操作不可撤销。`)) {
        return
      }

      loading.value = true
      try {
        const response = await cancelOrderApi(orderId)
        if (response.status === 200) {
          alert('订单作废成功')
          await fetchOrders()
        } else {
          alert(response.data?.message || '作废失败')
        }
      } catch (error) {
        console.error('作废订单失败:', error)
        alert('作废订单失败')
      } finally {
        loading.value = false
      }
    }

    // 打开订单详情
    const openOrderDetailDrawer = async (order) => {
      orderDetailData.value = order
      showOrderDetailDrawer.value = true

      // 加载订单商品
      try {
        const response = await getOrderGoods(order.id)
        if (response.status === 200 && response.data) {
          const goodsList = response.data.goods || response.data
          console.log('订单详情商品原始数据:', goodsList)
          orderDetailGoods.value = goodsList.map(item => ({
            goods_id: item.goods_id || item.id,
            goods_name: item.goods_name || item.name,
            price: item.price,
            amount_receivable: item.amount_receivable || item.total_price,
            discount_amount: item.discount_amount || 0,
            isgroup: item.isgroup !== undefined ? item.isgroup : 1
          }))
          console.log('映射后的详情商品数据:', orderDetailGoods.value)
        }
      } catch (error) {
        console.error('获取订单商品失败:', error)
      }
    }

    // 关闭订单详情
    const closeOrderDetailDrawer = () => {
      showOrderDetailDrawer.value = false
      orderDetailGoods.value = []
    }

    // 申请退费
    const openRefundDialog = (orderId) => {
      alert('申请退费功能开发中...')
    }

    // 获取订单状态文本
    const getOrderStatusText = (status) => {
      return statusMap[status] || '未知'
    }

    onMounted(async () => {
      await fetchOrders()
      mounted.value = true
    })

    return {
      mounted,
      loading,
      orders,
      filters,
      filteredOrders,
      paginatedOrders,
      currentPage,
      totalPages,
      showAddOrderDrawer,
      showAddOrderGoodsModal,
      showOrderDetailDrawer,
      isEditMode,
      addOrderData,
      selectedOrderGoods,
      addOrderGoodsData,
      orderDetailData,
      orderDetailGoods,
      activeStudentsForOrder,
      availableGoodsForOrderSelection,
      orderTotalReceivable,
      orderDiscountAmount,
      orderTotalReceived,
      hasPermission,
      searchOrders,
      resetFilters,
      openAddOrderDrawer,
      openEditOrderDrawer,
      closeAddOrderDrawer,
      openAddOrderGoodsModal,
      closeAddOrderGoodsModal,
      onOrderStudentChange,
      onOrderGoodsChange,
      saveOrderGoods,
      removeOrderGoods,
      saveAddOrder,
      cancelOrder,
      openOrderDetailDrawer,
      closeOrderDetailDrawer,
      openRefundDialog,
      getOrderStatusText
    }
  }
}
</script>

<style scoped>
/* Drawer样式 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.drawer {
  background: white;
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.drawer-header {
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.drawer-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

.drawer-footer {
  padding: 20px 30px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #f8f9fa;
}

/* 表单布局 */
.form-group {
  text-align: left;
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-group input.readonly-input {
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

.readonly-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #666;
}

.styled-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.styled-select:disabled,
.form-group-col select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #666;
  opacity: 1;
}

/* 商品表格 */
.included-goods-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}

.included-goods-table th,
.included-goods-table td {
  padding: 10px;
  text-align: left;
  border: 1px solid #ddd;
}

.included-goods-table th {
  background-color: #f5f5f5;
  font-weight: bold;
  font-size: 14px;
}

.included-goods-table td {
  font-size: 14px;
}

.add-included-btn {
  width: 100%;
  padding: 10px;
  border: 2px dashed #4CAF50;
  background-color: white;
  color: #4CAF50;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-included-btn:hover {
  background-color: #f0f8f0;
  border-color: #45a049;
}

/* 详情展示 */
.detail-info {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}

.detail-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #e8e8e8;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  width: 120px;
  font-weight: 500;
  color: #666;
}

.detail-row .value {
  flex: 1;
  color: #333;
}

/* 退费按钮样式 */
/* 操作列按钮样式 */
.action-column .edit-btn,
.action-column .delete-btn,
.action-column .view-btn,
.action-column .refund-btn {
  padding: 6px 12px;
  font-size: 12px;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 3px;
  min-width: 60px;
  text-align: center;
  transition: background-color 0.2s;
}

.action-column .edit-btn {
  background-color: #f39c12;
}

.action-column .edit-btn:hover {
  background-color: #e67e22;
}

.action-column .delete-btn {
  background-color: #e74c3c;
}

.action-column .delete-btn:hover {
  background-color: #c0392b;
}

.action-column .view-btn {
  background-color: #f39c12;
}

.action-column .view-btn:hover {
  background-color: #e67e22;
}

.action-column .refund-btn {
  background-color: #ff9800;
}

.action-column .refund-btn:hover {
  background-color: #f57c00;
}

/* 弹窗/抽屉中的按钮样式 */
.cancel-btn,
.save-btn,
.drawer-footer .delete-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-btn {
  background-color: #95a5a6;
  color: #fff;
}

.cancel-btn:hover {
  background-color: #7f8c8d;
}

.save-btn {
  background-color: #3498db;
  color: #fff;
}

.save-btn:hover {
  background-color: #2980b9;
}

.drawer-footer .delete-btn {
  background-color: #e74c3c;
  color: #fff;
}

.drawer-footer .delete-btn:hover {
  background-color: #c0392b;
}
</style>
