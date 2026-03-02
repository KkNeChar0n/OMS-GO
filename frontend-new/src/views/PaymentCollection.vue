<template>
  <div style="position: relative;">
    <!-- Loading遮罩层 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <div class="page-header">
      <h1>收款管理</h1>
      <button class="add-btn" @click="paymentCollectionTab === 'taobao' ? openAddTaobaoPaymentModal() : openAddPaymentCollectionModal()">新增收款</button>
    </div>

    <!-- 一级Tab -->
    <div class="tab-container">
      <div class="tab-nav">
        <button
          class="tab-btn"
          :class="{ active: paymentCollectionTab === 'regular' }"
          @click="paymentCollectionTab = 'regular'">
          常规收款
        </button>
        <button
          class="tab-btn"
          :class="{ active: paymentCollectionTab === 'taobao' }"
          @click="paymentCollectionTab = 'taobao'; taobaoSubTab = 'paid'; fetchTaobaoPayments()">
          淘宝收款
        </button>
      </div>

      <!-- 常规收款内容 -->
      <div v-if="paymentCollectionTab === 'regular'" class="tab-content">
        <!-- 二级Tab -->
        <div class="sub-tab-nav">
          <button
            class="sub-tab-btn"
            :class="{ active: paymentCollectionSubTab === 'received' }"
            @click="paymentCollectionSubTab = 'received'; fetchPaymentCollections()">
            已收款
          </button>
          <button
            class="sub-tab-btn"
            :class="{ active: paymentCollectionSubTab === 'pending' }"
            @click="paymentCollectionSubTab = 'pending'; fetchUnclaimedPayments()">
            待认领
          </button>
        </div>

        <!-- 已收款内容 -->
        <div v-if="paymentCollectionSubTab === 'received'">
          <!-- 筛选区 -->
          <div class="filter-form">
            <div class="filter-row">
              <div class="filter-item">
                <label for="pcIdFilter">ID</label>
                <input type="text" id="pcIdFilter" v-model="paymentCollectionFilters.id" placeholder="请输入ID">
              </div>
              <div class="filter-item">
                <label for="pcUidFilter">UID</label>
                <input type="text" id="pcUidFilter" v-model="paymentCollectionFilters.student_id" placeholder="请输入UID">
              </div>
              <div class="filter-item">
                <label for="pcOrderIdFilter">订单ID</label>
                <input type="text" id="pcOrderIdFilter" v-model="paymentCollectionFilters.order_id" placeholder="请输入订单ID">
              </div>
              <div class="filter-item">
                <label for="pcPayerFilter">付款人</label>
                <input type="text" id="pcPayerFilter" v-model="paymentCollectionFilters.payer" placeholder="请输入付款人">
              </div>
              <div class="filter-item">
                <label for="pcMethodFilter">付款方式</label>
                <select id="pcMethodFilter" v-model="paymentCollectionFilters.payment_method">
                  <option value="">全部</option>
                  <option value="0">微信</option>
                  <option value="1">支付宝</option>
                  <option value="2">优利支付</option>
                  <option value="3">零零购支付</option>
                  <option value="9">对公转账</option>
                </select>
              </div>
              <div class="filter-item">
                <label for="pcDateFilter">付款时间</label>
                <input type="date" id="pcDateFilter" v-model="paymentCollectionFilters.trading_date">
              </div>
              <div class="filter-item">
                <label for="pcStatusFilter">状态</label>
                <select id="pcStatusFilter" v-model="paymentCollectionFilters.status">
                  <option value="">全部</option>
                  <option value="0">待支付</option>
                  <option value="10">未核验</option>
                  <option value="20">已支付</option>
                </select>
              </div>
            </div>
            <div class="filter-actions">
              <button class="search-btn" @click="searchPaymentCollections">搜索</button>
              <button class="reset-btn" @click="resetPaymentCollectionFilters">重置</button>
            </div>
          </div>

          <!-- 列表区 -->
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>UID</th>
                <th>订单ID</th>
                <th>付款场景</th>
                <th>付款方式</th>
                <th>付款金额</th>
                <th>付款方</th>
                <th>收款主体</th>
                <th>商户订单号</th>
                <th>交易时间</th>
                <th>到账时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pc in paginatedPaymentCollections" :key="pc.id">
                <td>{{ pc.id }}</td>
                <td>{{ pc.student_id || '-' }}</td>
                <td>{{ pc.order_id || '-' }}</td>
                <td>{{ getPaymentScenarioText(pc.payment_scenario) }}</td>
                <td>{{ getPaymentMethodText(pc.payment_method) }}</td>
                <td>{{ pc.payment_amount }}</td>
                <td>{{ pc.payer || '-' }}</td>
                <td>{{ getPayeeEntityText(pc.payee_entity) }}</td>
                <td>{{ pc.merchant_order || '-' }}</td>
                <td>{{ formatDateTime(pc.trading_hours) }}</td>
                <td>{{ pc.arrival_time ? formatDateTime(pc.arrival_time) : '-' }}</td>
                <td>{{ getCollectionStatusText(pc.status) }}</td>
                <td class="action-column">
                  <button
                    v-if="pc.status === 10"
                    class="edit-btn"
                    @click="confirmPaymentCollection(pc)">
                    确认到账
                  </button>
                  <button
                    v-if="pc.status === 10"
                    class="delete-btn"
                    @click="confirmDeletePaymentCollection(pc)">
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 分页控件 -->
          <div class="pagination" v-if="paymentCollectionTotalPages > 1">
            <button class="page-btn" @click="changePaymentCollectionPage(1)" :disabled="paymentCollectionCurrentPage === 1">首页</button>
            <button class="page-btn" @click="changePaymentCollectionPage(paymentCollectionCurrentPage - 1)" :disabled="paymentCollectionCurrentPage === 1">上一页</button>
            <span class="page-info">第 {{ paymentCollectionCurrentPage }} / {{ paymentCollectionTotalPages }} 页</span>
            <button class="page-btn" @click="changePaymentCollectionPage(paymentCollectionCurrentPage + 1)" :disabled="paymentCollectionCurrentPage === paymentCollectionTotalPages">下一页</button>
            <button class="page-btn" @click="changePaymentCollectionPage(paymentCollectionTotalPages)" :disabled="paymentCollectionCurrentPage === paymentCollectionTotalPages">末页</button>
          </div>
        </div>

        <!-- 待认领内容 -->
        <div v-if="paymentCollectionSubTab === 'pending'">
          <!-- 操作按钮区 -->
          <div class="page-header" style="margin-bottom: 20px;">
            <div>
              <button class="add-btn" @click="downloadUnclaimedTemplate">模板下载</button>
              <label for="unclaimedImport" class="add-btn" style="margin-left: 10px; cursor: pointer;">
                模板导入
                <input type="file" id="unclaimedImport" @change="onUnclaimedFileChange" accept=".xls,.xlsx" style="display: none;">
              </label>
            </div>
          </div>

          <!-- 筛选区 -->
          <div class="filter-form">
            <div class="filter-row">
              <div class="filter-item">
                <label for="unclaimedIdFilter">ID</label>
                <input type="number" id="unclaimedIdFilter" v-model="unclaimedFilters.id" placeholder="请输入ID">
              </div>
              <div class="filter-item">
                <label for="unclaimedPayerFilter">付款方</label>
                <input type="text" id="unclaimedPayerFilter" v-model="unclaimedFilters.payer" placeholder="请输入付款方">
              </div>
              <div class="filter-item">
                <label for="unclaimedMethodFilter">付款方式</label>
                <select id="unclaimedMethodFilter" v-model="unclaimedFilters.payment_method">
                  <option value="">全部</option>
                  <option value="0">微信</option>
                  <option value="1">支付宝</option>
                  <option value="2">优利支付</option>
                  <option value="3">零零购支付</option>
                  <option value="9">对公转账</option>
                </select>
              </div>
              <div class="filter-item">
                <label for="unclaimedDateFilter">到账时间</label>
                <input type="date" id="unclaimedDateFilter" v-model="unclaimedFilters.arrival_date">
              </div>
              <div class="filter-item">
                <label for="unclaimedClaimerFilter">认领人</label>
                <input type="text" id="unclaimedClaimerFilter" v-model="unclaimedFilters.claimer" placeholder="请输入认领人">
              </div>
              <div class="filter-item">
                <label for="unclaimedStatusFilter">状态</label>
                <select id="unclaimedStatusFilter" v-model="unclaimedFilters.status">
                  <option value="">全部</option>
                  <option value="0">待认领</option>
                  <option value="1">已认领</option>
                </select>
              </div>
            </div>
            <div class="filter-actions">
              <button class="search-btn" @click="fetchUnclaimedPayments">搜索</button>
              <button class="reset-btn" @click="resetUnclaimedFilters">重置</button>
            </div>
          </div>

          <!-- 列表区 -->
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>付款方式</th>
                <th>付款金额</th>
                <th>付款方</th>
                <th>收款主体</th>
                <th>商户订单号</th>
                <th>到账时间</th>
                <th>认领人</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="uc in paginatedUnclaimed" :key="uc.id">
                <td>{{ uc.id }}</td>
                <td>{{ getPaymentMethodText(uc.payment_method) }}</td>
                <td>{{ uc.payment_amount }}</td>
                <td>{{ uc.payer || '-' }}</td>
                <td>{{ getPayeeEntityText(uc.payee_entity) }}</td>
                <td>{{ uc.merchant_order || '-' }}</td>
                <td>{{ uc.arrival_time ? new Date(uc.arrival_time).toLocaleDateString() : '' }}</td>
                <td>{{ uc.claimer_name || '-' }}</td>
                <td>{{ getUnclaimedStatusText(uc.status) }}</td>
                <td class="action-column">
                  <button
                    v-if="uc.status === 0"
                    class="edit-btn"
                    @click="openClaimModal(uc)">
                    认领
                  </button>
                  <button
                    v-if="uc.status === 0"
                    class="delete-btn"
                    @click="confirmDeleteUnclaimed(uc)">
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 分页控件 -->
          <div class="pagination" v-if="unclaimedTotalPages > 1">
            <button class="page-btn" @click="changeUnclaimedPage(1)" :disabled="unclaimedCurrentPage === 1">首页</button>
            <button class="page-btn" @click="changeUnclaimedPage(unclaimedCurrentPage - 1)" :disabled="unclaimedCurrentPage === 1">上一页</button>
            <span class="page-info">第 {{ unclaimedCurrentPage }} 页 / 共 {{ unclaimedTotalPages }} 页</span>
            <button class="page-btn" @click="changeUnclaimedPage(unclaimedCurrentPage + 1)" :disabled="unclaimedCurrentPage === unclaimedTotalPages">下一页</button>
            <button class="page-btn" @click="changeUnclaimedPage(unclaimedTotalPages)" :disabled="unclaimedCurrentPage === unclaimedTotalPages">末页</button>
          </div>
        </div>
      </div>

      <!-- 淘宝收款内容 -->
      <div v-if="paymentCollectionTab === 'taobao'" class="tab-content">
        <!-- 二级Tab -->
        <div class="sub-tab-nav">
          <button
            class="sub-tab-btn"
            :class="{ active: taobaoSubTab === 'paid' }"
            @click="taobaoSubTab = 'paid'; fetchTaobaoPayments()">
            已付款
          </button>
          <button
            class="sub-tab-btn"
            :class="{ active: taobaoSubTab === 'unclaimed' }"
            @click="taobaoSubTab = 'unclaimed'; fetchTaobaoUnclaimedList()">
            待认领
          </button>
        </div>

        <!-- 已付款内容 -->
        <div v-if="taobaoSubTab === 'paid'">
          <!-- 筛选区 -->
          <div class="filter-form">
            <div class="filter-row">
              <div class="filter-item">
                <label for="taobaoIdFilter">ID</label>
                <input type="text" id="taobaoIdFilter" v-model="taobaoPaymentFilters.id" placeholder="请输入ID">
              </div>
              <div class="filter-item">
                <label for="taobaoStudentIdFilter">UID</label>
                <input type="text" id="taobaoStudentIdFilter" v-model="taobaoPaymentFilters.student_id" placeholder="请输入UID">
              </div>
              <div class="filter-item">
                <label for="taobaoOrderIdFilter">订单ID</label>
                <input type="text" id="taobaoOrderIdFilter" v-model="taobaoPaymentFilters.order_id" placeholder="请输入订单ID">
              </div>
              <div class="filter-item">
                <label for="taobaoOrderTimeFilter">下单时间</label>
                <input type="date" id="taobaoOrderTimeFilter" v-model="taobaoPaymentFilters.order_time">
              </div>
              <div class="filter-item">
                <label for="taobaoStatusFilter">状态</label>
                <select id="taobaoStatusFilter" v-model="taobaoPaymentFilters.status">
                  <option value="">全部</option>
                  <option value="0">已下单</option>
                  <option value="30">已到账</option>
                  <option value="40">已退单</option>
                </select>
              </div>
            </div>
            <div class="filter-actions">
              <button class="search-btn" @click="searchTaobaoPayments">搜索</button>
              <button class="reset-btn" @click="resetTaobaoPaymentFilters">重置</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>UID</th>
                <th>订单ID</th>
                <th>付款方</th>
                <th>支付宝账号</th>
                <th>金额</th>
                <th>下单时间</th>
                <th>到账时间</th>
                <th>商户订单号</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tp in paginatedTaobaoPayments" :key="tp.id">
                <td>{{ tp.id }}</td>
                <td>{{ tp.student_id || '-' }}</td>
                <td>{{ tp.order_id || '-' }}</td>
                <td>{{ tp.payer || '-' }}</td>
                <td>{{ tp.zhifubao_account || '-' }}</td>
                <td>{{ tp.payment_amount }}</td>
                <td>{{ formatDateTime(tp.order_time) }}</td>
                <td>{{ tp.arrival_time ? formatDateTime(tp.arrival_time) : '-' }}</td>
                <td>{{ tp.merchant_order || '-' }}</td>
                <td>{{ getTaobaoStatusText(tp.status) }}</td>
                <td class="action-column">
                  <button
                    v-if="tp.status === 0"
                    class="edit-btn"
                    @click="confirmTaobaoArrival(tp)">
                    确认到账
                  </button>
                  <button
                    v-if="tp.status !== 30"
                    class="delete-btn"
                    @click="confirmDeleteTaobaoPayment(tp)">
                    删除
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedTaobaoPayments.length === 0">
                <td colspan="11" style="text-align: center; padding: 20px;">暂无数据</td>
              </tr>
            </tbody>
          </table>

          <!-- 分页控件 -->
          <div class="pagination" v-if="totalTaobaoPaymentPages > 1">
            <button class="page-btn" @click="changeTaobaoPaymentPage(1)" :disabled="taobaoPaymentCurrentPage === 1">首页</button>
            <button class="page-btn" @click="changeTaobaoPaymentPage(taobaoPaymentCurrentPage - 1)" :disabled="taobaoPaymentCurrentPage === 1">上一页</button>
            <span class="page-info">第 {{ taobaoPaymentCurrentPage }} / {{ totalTaobaoPaymentPages }} 页</span>
            <button class="page-btn" @click="changeTaobaoPaymentPage(taobaoPaymentCurrentPage + 1)" :disabled="taobaoPaymentCurrentPage === totalTaobaoPaymentPages">下一页</button>
            <button class="page-btn" @click="changeTaobaoPaymentPage(totalTaobaoPaymentPages)" :disabled="taobaoPaymentCurrentPage === totalTaobaoPaymentPages">末页</button>
          </div>
        </div>

        <!-- 待认领内容 -->
        <div v-if="taobaoSubTab === 'unclaimed'">
          <!-- 操作按钮区 -->
          <div class="page-header" style="margin-bottom: 20px;">
            <div>
              <button class="add-btn" @click="downloadTaobaoUnclaimedTemplate">模板下载</button>
              <label for="taobaoTemplateImport" class="add-btn" style="margin-left: 10px; cursor: pointer;">
                模板导入
                <input type="file" id="taobaoTemplateImport" @change="onTaobaoUnclaimedFileChange" accept=".xlsx,.xls" style="display: none;">
              </label>
            </div>
          </div>

          <!-- 筛选区 -->
          <div class="filter-form">
            <div class="filter-row">
              <div class="filter-item">
                <label for="taobaoUnclaimedIdFilter">ID</label>
                <input type="text" id="taobaoUnclaimedIdFilter" v-model="taobaoUnclaimedFilters.id" placeholder="请输入ID">
              </div>
              <div class="filter-item">
                <label for="taobaoArrivalTimeFilter">到账时间</label>
                <input type="date" id="taobaoArrivalTimeFilter" v-model="taobaoUnclaimedFilters.arrival_time">
              </div>
              <div class="filter-item">
                <label for="taobaoUnclaimedStatusFilter">状态</label>
                <select id="taobaoUnclaimedStatusFilter" v-model="taobaoUnclaimedFilters.status">
                  <option value="">全部</option>
                  <option value="10">待认领</option>
                  <option value="20">已认领</option>
                </select>
              </div>
            </div>
            <div class="filter-actions">
              <button class="search-btn" @click="fetchTaobaoUnclaimedList">搜索</button>
              <button class="reset-btn" @click="resetTaobaoUnclaimedFilters">重置</button>
            </div>
          </div>

          <!-- 列表区 -->
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>付款方</th>
                <th>支付宝账号</th>
                <th>金额</th>
                <th>到账时间</th>
                <th>商户订单号</th>
                <th>状态</th>
                <th>认领人ID</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tu in paginatedTaobaoUnclaimed" :key="tu.id">
                <td>{{ tu.id }}</td>
                <td>{{ tu.payer || '-' }}</td>
                <td>{{ tu.zhifubao_account || '-' }}</td>
                <td>{{ tu.payment_amount }}</td>
                <td>{{ tu.arrival_time ? tu.arrival_time.replace('T', ' ').substring(0, 19) : '-' }}</td>
                <td>{{ tu.merchant_order || '-' }}</td>
                <td>{{ getTaobaoUnclaimedStatusText(tu.status) }}</td>
                <td>{{ tu.claimer || '-' }}</td>
                <td class="action-column">
                  <button
                    v-if="tu.status === 10"
                    class="edit-btn"
                    @click="openClaimTaobaoModal(tu)">
                    认领
                  </button>
                  <button
                    v-if="tu.status === 10"
                    class="delete-btn"
                    @click="confirmDeleteTaobaoUnclaimed(tu)">
                    删除
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedTaobaoUnclaimed.length === 0">
                <td colspan="9" style="text-align: center; padding: 20px;">暂无数据</td>
              </tr>
            </tbody>
          </table>

          <!-- 分页控件 -->
          <div class="pagination" v-if="taobaoUnclaimedTotalPages > 1">
            <button class="page-btn" @click="changeTaobaoUnclaimedPage(taobaoUnclaimedCurrentPage - 1)" :disabled="taobaoUnclaimedCurrentPage === 1">上一页</button>
            <span>第 {{ taobaoUnclaimedCurrentPage }} / {{ taobaoUnclaimedTotalPages }} 页</span>
            <button class="page-btn" @click="changeTaobaoUnclaimedPage(taobaoUnclaimedCurrentPage + 1)" :disabled="taobaoUnclaimedCurrentPage === taobaoUnclaimedTotalPages">下一页</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增收款模态框 -->
    <div class="modal-overlay" v-if="showAddPaymentCollectionModal">
      <div class="modal" style="width: 500px;">
        <div class="modal-header">
          <h3>新增收款</h3>
          <button class="close-btn" @click="closeAddPaymentCollectionModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>学生姓名 <span class="required">*</span></label>
            <select v-model="paymentCollectionForm.student_id" @change="onPaymentStudentChange">
              <option value="">请选择学生</option>
              <option v-for="student in activeStudents" :key="student.id" :value="student.id">
                {{ student.student_name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>UID</label>
            <input type="text" :value="paymentCollectionForm.student_id" readonly class="readonly-input">
          </div>
          <div class="form-group">
            <label>订单ID <span class="required">*</span></label>
            <select v-model="paymentCollectionForm.order_id" @change="onPaymentOrderChange">
              <option value="">请选择订单</option>
              <option v-for="order in studentUnpaidOrders" :key="order.id" :value="order.id">
                {{ order.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>待支付金额</label>
            <input type="text" :value="paymentCollectionForm.pending_amount" readonly class="readonly-input">
          </div>
          <div class="form-group">
            <label>付款场景 <span class="required">*</span></label>
            <select v-model="paymentCollectionForm.payment_scenario" @change="onPaymentScenarioChange">
              <option value="">请选择</option>
              <option value="0">线上</option>
              <option value="1">线下</option>
            </select>
          </div>
          <div class="form-group">
            <label>付款方式 <span class="required">*</span></label>
            <select v-model="paymentCollectionForm.payment_method">
              <option value="">请选择</option>
              <template v-if="paymentCollectionForm.payment_scenario === '0'">
                <option value="0">微信</option>
                <option value="1">支付宝</option>
                <option value="3">零零购支付</option>
                <option value="2">优利支付</option>
              </template>
              <template v-if="paymentCollectionForm.payment_scenario === '1'">
                <option value="0">微信</option>
                <option value="1">支付宝</option>
                <option value="9">对公转账</option>
                <option value="3">零零购支付</option>
                <option value="2">优利支付</option>
              </template>
            </select>
          </div>
          <div class="form-group">
            <label>付款金额 <span class="required">*</span></label>
            <input type="number" step="0.01" v-model="paymentCollectionForm.payment_amount" placeholder="请输入付款金额">
          </div>
          <div class="form-group">
            <label>付款人</label>
            <input type="text" v-model="paymentCollectionForm.payer" placeholder="请输入付款人">
          </div>
          <div class="form-group">
            <label>收款主体 <span class="required">*</span></label>
            <select v-model="paymentCollectionForm.payee_entity">
              <option value="">请选择</option>
              <option value="0">北京</option>
              <option value="1">西安</option>
            </select>
          </div>
          <div class="form-group" v-if="paymentCollectionForm.payment_scenario === '1'">
            <label>商户订单号 <span class="required">*</span></label>
            <input type="text" v-model="paymentCollectionForm.merchant_order" placeholder="请输入商户订单号">
          </div>
          <div class="form-group" v-if="paymentCollectionForm.payment_scenario === '1'">
            <label>交易时间</label>
            <input type="date" v-model="paymentCollectionForm.trading_hours">
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeAddPaymentCollectionModal">取消</button>
          <button class="save-btn" @click="submitPaymentCollection">确认</button>
        </div>
      </div>
    </div>

    <!-- 确认到账弹窗 -->
    <div class="modal-overlay" v-if="showConfirmPaymentModal">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3>确认到账</h3>
        </div>
        <div class="modal-body">
          <p>是否确认到账？</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showConfirmPaymentModal = false">取消</button>
          <button class="save-btn" @click="doConfirmPayment">确认</button>
        </div>
      </div>
    </div>

    <!-- 删除收款确认弹窗 -->
    <div class="modal-overlay" v-if="showDeletePaymentModal">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3>删除确认</h3>
        </div>
        <div class="modal-body">
          <p>是否确认删除？</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showDeletePaymentModal = false">取消</button>
          <button class="delete-btn" @click="doDeletePayment">确认</button>
        </div>
      </div>
    </div>

    <!-- 确认淘宝到账弹窗 -->
    <div class="modal-overlay" v-if="showConfirmTaobaoModal">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3>确认到账</h3>
        </div>
        <div class="modal-body">
          <p>是否确认淘宝收款到账？</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showConfirmTaobaoModal = false">取消</button>
          <button class="save-btn" @click="doConfirmTaobaoArrival">确认</button>
        </div>
      </div>
    </div>

    <!-- 删除淘宝收款确认弹窗 -->
    <div class="modal-overlay" v-if="showDeleteTaobaoModal">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3>删除确认</h3>
        </div>
        <div class="modal-body">
          <p>是否确认删除淘宝收款？</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showDeleteTaobaoModal = false">取消</button>
          <button class="delete-btn" @click="doDeleteTaobaoPayment">确认</button>
        </div>
      </div>
    </div>

    <!-- 新增淘宝收款模态框 -->
    <div class="modal-overlay" v-if="showAddTaobaoPaymentModal">
      <div class="modal" style="width: 500px;">
        <div class="modal-header">
          <h3>新增淘宝收款</h3>
          <button class="close-btn" @click="closeAddTaobaoPaymentModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>学生姓名 <span class="required">*</span></label>
            <select v-model="taobaoPaymentForm.student_id" @change="onTaobaoStudentChange">
              <option value="">请选择学生</option>
              <option v-for="student in activeStudents" :key="student.id" :value="student.id">
                {{ student.student_name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>UID</label>
            <input type="text" :value="taobaoPaymentForm.student_id" readonly class="readonly-input">
          </div>
          <div class="form-group">
            <label>订单ID <span class="required">*</span></label>
            <select v-model="taobaoPaymentForm.order_id" @change="onTaobaoOrderChange">
              <option value="">请选择订单</option>
              <option v-for="order in studentUnpaidOrders" :key="order.id" :value="order.id">
                {{ order.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>待支付金额</label>
            <input type="text" :value="taobaoPaymentForm.pending_amount" readonly class="readonly-input">
          </div>
          <div class="form-group">
            <label>付款方</label>
            <input type="text" v-model="taobaoPaymentForm.payer" placeholder="请输入付款方">
          </div>
          <div class="form-group">
            <label>支付宝账号</label>
            <input type="text" v-model="taobaoPaymentForm.zhifubao_account" placeholder="请输入支付宝账号">
          </div>
          <div class="form-group">
            <label>付款金额 <span class="required">*</span></label>
            <input type="number" step="0.01" v-model="taobaoPaymentForm.payment_amount" placeholder="请输入付款金额">
          </div>
          <div class="form-group">
            <label>下单时间 <span class="required">*</span></label>
            <input type="datetime-local" v-model="taobaoPaymentForm.order_time">
          </div>
          <div class="form-group">
            <label>商户订单号</label>
            <input type="text" v-model="taobaoPaymentForm.merchant_order" placeholder="请输入商户订单号">
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeAddTaobaoPaymentModal">取消</button>
          <button class="save-btn" @click="submitTaobaoPayment">确认</button>
        </div>
      </div>
    </div>

    <!-- 认领常规待认领模态框 -->
    <div class="modal-overlay" v-if="showClaimModal">
      <div class="modal" style="width: 400px;">
        <div class="modal-header">
          <h3>认领收款</h3>
          <button class="close-btn" @click="showClaimModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>订单ID <span class="required">*</span></label>
            <input type="number" v-model="claimForm.order_id" placeholder="请输入订单ID">
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showClaimModal = false">取消</button>
          <button class="save-btn" @click="doClaimUnclaimed">确认</button>
        </div>
      </div>
    </div>

    <!-- 删除常规待认领确认弹窗 -->
    <div class="modal-overlay" v-if="showDeleteUnclaimedModal">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3>删除确认</h3>
        </div>
        <div class="modal-body">
          <p>是否确认删除待认领记录？</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showDeleteUnclaimedModal = false">取消</button>
          <button class="delete-btn" @click="doDeleteUnclaimed">确认</button>
        </div>
      </div>
    </div>

    <!-- 认领淘宝待认领模态框 -->
    <div class="modal-overlay" v-if="showClaimTaobaoModal">
      <div class="modal" style="width: 400px;">
        <div class="modal-header">
          <h3>认领淘宝收款</h3>
          <button class="close-btn" @click="showClaimTaobaoModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>订单ID <span class="required">*</span></label>
            <input type="number" v-model="claimTaobaoForm.order_id" placeholder="请输入订单ID">
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showClaimTaobaoModal = false">取消</button>
          <button class="save-btn" @click="doClaimTaobaoUnclaimed">确认</button>
        </div>
      </div>
    </div>

    <!-- 删除淘宝待认领确认弹窗 -->
    <div class="modal-overlay" v-if="showDeleteTaobaoUnclaimedModal">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3>删除确认</h3>
        </div>
        <div class="modal-body">
          <p>是否确认删除淘宝待认领记录？</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showDeleteTaobaoUnclaimedModal = false">取消</button>
          <button class="delete-btn" @click="doDeleteTaobaoUnclaimed">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  getPaymentCollections,
  getTaobaoPayments,
  createPaymentCollection,
  confirmPaymentCollection as confirmPaymentAPI,
  deletePaymentCollection as deletePaymentAPI,
  getActiveStudents,
  getStudentUnpaidOrders,
  getOrderPendingAmount,
  confirmTaobaoPayment,
  deleteTaobaoPayment,
  getTaobaoUnclaimed,
  createTaobaoPayment,
  claimTaobaoPayment,
  deleteTaobaoUnclaimed,
  downloadTaobaoTemplate as downloadTaobaoTemplateAPI,
  importTaobaoExcel,
  getUnclaimedList,
  claimUnclaimed,
  deleteUnclaimed,
  downloadUnclaimedTemplate as downloadUnclaimedTemplateAPI,
  importUnclaimedExcel
} from '@/api/contract'

// 加载状态
const loading = ref(false)

// Tab状态
const paymentCollectionTab = ref('regular')
const paymentCollectionSubTab = ref('received')
const taobaoSubTab = ref('paid')

// 常规收款数据
const paymentCollections = ref([])
const filteredPaymentCollections = ref([])
const paymentCollectionFilters = ref({
  id: '',
  student_id: '',
  order_id: '',
  payer: '',
  payment_method: '',
  trading_date: '',
  status: ''
})
const paymentCollectionCurrentPage = ref(1)
const pageSize = 10

// 淘宝收款数据
const taobaoPayments = ref([])
const filteredTaobaoPayments = ref([])
const taobaoPaymentFilters = ref({
  id: '',
  student_id: '',
  order_id: '',
  order_time: '',
  status: ''
})
const taobaoPaymentCurrentPage = ref(1)

// 常规待认领数据
const unclaimedList = ref([])
const filteredUnclaimed = ref([])
const unclaimedFilters = ref({
  id: '',
  payer: '',
  payment_method: '',
  arrival_date: '',
  claimer: '',
  status: ''
})
const unclaimedCurrentPage = ref(1)

// 淘宝待认领数据
const taobaoUnclaimedList = ref([])
const filteredTaobaoUnclaimed = ref([])
const taobaoUnclaimedFilters = ref({
  id: '',
  arrival_time: '',
  status: ''
})
const taobaoUnclaimedCurrentPage = ref(1)

// 新增收款表单
const showAddPaymentCollectionModal = ref(false)
const paymentCollectionForm = ref({
  student_id: '',
  order_id: '',
  pending_amount: '',
  payment_scenario: '',
  payment_method: '',
  payment_amount: '',
  payer: '',
  payee_entity: '',
  merchant_order: '',
  trading_hours: ''
})
const activeStudents = ref([])
const studentUnpaidOrders = ref([])
const selectedOrderInfo = ref(null)

// 确认/删除模态框
const showConfirmPaymentModal = ref(false)
const showDeletePaymentModal = ref(false)
const currentPaymentCollection = ref(null)

const showConfirmTaobaoModal = ref(false)
const showDeleteTaobaoModal = ref(false)
const currentTaobaoPayment = ref(null)

// 新增淘宝收款表单和模态框
const showAddTaobaoPaymentModal = ref(false)
const taobaoPaymentForm = ref({
  student_id: '',
  order_id: '',
  pending_amount: '',
  payer: '',
  zhifubao_account: '',
  payment_amount: '',
  order_time: '',
  merchant_order: ''
})

// 常规待认领模态框
const showClaimModal = ref(false)
const showDeleteUnclaimedModal = ref(false)
const currentUnclaimed = ref(null)
const claimForm = ref({
  order_id: ''
})

// 淘宝待认领模态框
const showClaimTaobaoModal = ref(false)
const showDeleteTaobaoUnclaimedModal = ref(false)
const currentTaobaoUnclaimed = ref(null)
const claimTaobaoForm = ref({
  order_id: ''
})

// 计算属性
const paginatedPaymentCollections = computed(() => {
  const start = (paymentCollectionCurrentPage.value - 1) * pageSize
  return filteredPaymentCollections.value.slice(start, start + pageSize)
})

const paymentCollectionTotalPages = computed(() => {
  return Math.ceil(filteredPaymentCollections.value.length / pageSize)
})

const paginatedTaobaoPayments = computed(() => {
  const start = (taobaoPaymentCurrentPage.value - 1) * 10
  return filteredTaobaoPayments.value.slice(start, start + 10)
})

const totalTaobaoPaymentPages = computed(() => {
  return Math.ceil(filteredTaobaoPayments.value.length / 10)
})

const paginatedUnclaimed = computed(() => {
  const start = (unclaimedCurrentPage.value - 1) * pageSize
  return filteredUnclaimed.value.slice(start, start + pageSize)
})

const unclaimedTotalPages = computed(() => {
  return Math.ceil(filteredUnclaimed.value.length / pageSize)
})

const paginatedTaobaoUnclaimed = computed(() => {
  const start = (taobaoUnclaimedCurrentPage.value - 1) * pageSize
  return filteredTaobaoUnclaimed.value.slice(start, start + pageSize)
})

const taobaoUnclaimedTotalPages = computed(() => {
  return Math.ceil(filteredTaobaoUnclaimed.value.length / pageSize)
})

// 获取收款列表
const fetchPaymentCollections = async () => {
  loading.value = true
  try {
    const response = await getPaymentCollections()
    if (response.data.code === 0 && response.data.data) {
      paymentCollections.value = response.data.data.collections || []
      filteredPaymentCollections.value = paymentCollections.value
    }
  } catch (error) {
    console.error('获取收款数据失败:', error)
    alert('获取收款数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索收款
const searchPaymentCollections = () => {
  filteredPaymentCollections.value = paymentCollections.value.filter(pc => {
    if (paymentCollectionFilters.value.id && pc.id != paymentCollectionFilters.value.id) return false
    if (paymentCollectionFilters.value.student_id && pc.student_id != paymentCollectionFilters.value.student_id) return false
    if (paymentCollectionFilters.value.order_id && pc.order_id != paymentCollectionFilters.value.order_id) return false
    if (paymentCollectionFilters.value.payer && pc.payer !== paymentCollectionFilters.value.payer) return false
    if (paymentCollectionFilters.value.payment_method !== '' && pc.payment_method != paymentCollectionFilters.value.payment_method) return false
    if (paymentCollectionFilters.value.trading_date) {
      const tradingDate = pc.trading_hours ? pc.trading_hours.split('T')[0] : ''
      if (tradingDate !== paymentCollectionFilters.value.trading_date) return false
    }
    if (paymentCollectionFilters.value.status !== '' && pc.status != paymentCollectionFilters.value.status) return false
    return true
  })
  paymentCollectionCurrentPage.value = 1
}

// 重置筛选
const resetPaymentCollectionFilters = () => {
  paymentCollectionFilters.value = {
    id: '',
    student_id: '',
    order_id: '',
    payer: '',
    payment_method: '',
    trading_date: '',
    status: ''
  }
  filteredPaymentCollections.value = paymentCollections.value
  paymentCollectionCurrentPage.value = 1
}

// 分页切换
const changePaymentCollectionPage = (page) => {
  paymentCollectionCurrentPage.value = page
}

// 获取淘宝收款列表
const fetchTaobaoPayments = async () => {
  loading.value = true
  try {
    const response = await getTaobaoPayments()
    if (response.data && response.data.payments) {
      taobaoPayments.value = response.data.payments || []
      filteredTaobaoPayments.value = taobaoPayments.value
    }
  } catch (error) {
    console.error('获取淘宝收款数据失败:', error)
    alert('获取淘宝收款数据失败')
  } finally {
    loading.value = false
  }
}

// 淘宝收款分页
const changeTaobaoPaymentPage = (page) => {
  taobaoPaymentCurrentPage.value = page
}

// 搜索淘宝收款
const searchTaobaoPayments = () => {
  filteredTaobaoPayments.value = taobaoPayments.value.filter(tp => {
    if (taobaoPaymentFilters.value.id && tp.id != taobaoPaymentFilters.value.id) return false
    if (taobaoPaymentFilters.value.student_id && tp.student_id != taobaoPaymentFilters.value.student_id) return false
    if (taobaoPaymentFilters.value.order_id && tp.order_id != taobaoPaymentFilters.value.order_id) return false
    if (taobaoPaymentFilters.value.order_time) {
      const orderDate = tp.order_time ? tp.order_time.split('T')[0] : ''
      if (orderDate !== taobaoPaymentFilters.value.order_time) return false
    }
    if (taobaoPaymentFilters.value.status !== '' && tp.status != taobaoPaymentFilters.value.status) return false
    return true
  })
  taobaoPaymentCurrentPage.value = 1
}

// 重置淘宝收款筛选
const resetTaobaoPaymentFilters = () => {
  taobaoPaymentFilters.value = {
    id: '',
    student_id: '',
    order_id: '',
    order_time: '',
    status: ''
  }
  filteredTaobaoPayments.value = taobaoPayments.value
  taobaoPaymentCurrentPage.value = 1
}

// 打开新增收款弹窗
const openAddPaymentCollectionModal = async () => {
  paymentCollectionForm.value = {
    student_id: '',
    order_id: '',
    pending_amount: '',
    payment_scenario: '',
    payment_method: '',
    payment_amount: '',
    payer: '',
    payee_entity: '',
    merchant_order: '',
    trading_hours: ''
  }
  studentUnpaidOrders.value = []
  selectedOrderInfo.value = null

  try {
    const response = await getActiveStudents()
    activeStudents.value = response.data.students || []
  } catch (error) {
    console.error('获取学生列表失败:', error)
    activeStudents.value = []
  }

  showAddPaymentCollectionModal.value = true
}

// 关闭新增收款弹窗
const closeAddPaymentCollectionModal = () => {
  showAddPaymentCollectionModal.value = false
}

// 打开新增淘宝收款弹窗（占位函数）
const openAddTaobaoPaymentModal = async () => {
  taobaoPaymentForm.value = {
    student_id: '',
    order_id: '',
    pending_amount: '',
    payer: '',
    zhifubao_account: '',
    payment_amount: '',
    order_time: '',
    merchant_order: ''
  }
  studentUnpaidOrders.value = []

  try {
    const response = await getActiveStudents()
    activeStudents.value = response.data.students || []
  } catch (error) {
    console.error('获取学生列表失败:', error)
    activeStudents.value = []
  }

  showAddTaobaoPaymentModal.value = true
}

// 关闭新增淘宝收款弹窗
const closeAddTaobaoPaymentModal = () => {
  showAddTaobaoPaymentModal.value = false
}

// 淘宝收款学生选择变化
const onTaobaoStudentChange = async () => {
  taobaoPaymentForm.value.order_id = ''
  taobaoPaymentForm.value.pending_amount = ''

  if (!taobaoPaymentForm.value.student_id) {
    studentUnpaidOrders.value = []
    return
  }

  try {
    const response = await getStudentUnpaidOrders(taobaoPaymentForm.value.student_id)
    studentUnpaidOrders.value = response.data.orders || []
  } catch (error) {
    console.error('获取学生订单失败:', error)
    studentUnpaidOrders.value = []
  }
}

// 淘宝收款订单选择变化
const onTaobaoOrderChange = async () => {
  taobaoPaymentForm.value.pending_amount = ''

  if (!taobaoPaymentForm.value.order_id) {
    return
  }

  try {
    const response = await getOrderPendingAmount(taobaoPaymentForm.value.order_id)
    taobaoPaymentForm.value.pending_amount = response.data.pending_amount
  } catch (error) {
    console.error('获取待支付金额失败:', error)
  }
}

// 提交新增淘宝收款
const submitTaobaoPayment = async () => {
  if (!taobaoPaymentForm.value.student_id ||
      !taobaoPaymentForm.value.order_id ||
      !taobaoPaymentForm.value.payment_amount ||
      !taobaoPaymentForm.value.order_time) {
    alert('请填写所有必填项')
    return
  }

  // 校验付款金额
  const paymentAmount = parseFloat(taobaoPaymentForm.value.payment_amount)
  const pendingAmount = parseFloat(taobaoPaymentForm.value.pending_amount)
  if (paymentAmount > pendingAmount) {
    alert(`付款金额不能超过待支付金额(${pendingAmount})`)
    return
  }

  try {
    const payload = {
      student_id: parseInt(taobaoPaymentForm.value.student_id),
      order_id: parseInt(taobaoPaymentForm.value.order_id),
      zhifubao_account: taobaoPaymentForm.value.zhifubao_account,
      payer: taobaoPaymentForm.value.payer,
      payment_amount: paymentAmount,
      order_time: taobaoPaymentForm.value.order_time,
      merchant_order: taobaoPaymentForm.value.merchant_order
    }

    const response = await createTaobaoPayment(payload)
    if (response.data.code === 0) {
      alert('淘宝收款新增成功')
      closeAddTaobaoPaymentModal()
      await fetchTaobaoPayments()
    } else {
      alert(response.data.message || '新增淘宝收款失败')
    }
  } catch (error) {
    console.error('新增淘宝收款失败:', error)
    alert(error.response?.data?.message || error.response?.data?.error || '新增淘宝收款失败')
  }
}

// 获取常规待认领列表
const fetchUnclaimedPayments = async () => {
  loading.value = true
  try {
    const response = await getUnclaimedList()
    if (response.data && response.data.unclaimed) {
      unclaimedList.value = response.data.unclaimed || []
      filteredUnclaimed.value = unclaimedList.value
    }
  } catch (error) {
    console.error('获取待认领数据失败:', error)
    alert('获取待认领数据失败')
  } finally {
    loading.value = false
  }
}

// 学生选择变化
const onPaymentStudentChange = async () => {
  paymentCollectionForm.value.order_id = ''
  paymentCollectionForm.value.pending_amount = ''
  selectedOrderInfo.value = null

  if (!paymentCollectionForm.value.student_id) {
    studentUnpaidOrders.value = []
    return
  }

  try {
    const response = await getStudentUnpaidOrders(paymentCollectionForm.value.student_id)
    studentUnpaidOrders.value = response.data.orders || []
  } catch (error) {
    console.error('获取学生订单失败:', error)
    studentUnpaidOrders.value = []
  }
}

// 订单选择变化
const onPaymentOrderChange = async () => {
  paymentCollectionForm.value.pending_amount = ''
  selectedOrderInfo.value = null

  if (!paymentCollectionForm.value.order_id) {
    return
  }

  try {
    const response = await getOrderPendingAmount(paymentCollectionForm.value.order_id)
    paymentCollectionForm.value.pending_amount = response.data.pending_amount
    selectedOrderInfo.value = {
      expected_payment_time: response.data.expected_payment_time
    }
  } catch (error) {
    console.error('获取待支付金额失败:', error)
  }
}

// 付款场景变化
const onPaymentScenarioChange = () => {
  paymentCollectionForm.value.payment_method = ''
}

// 提交新增收款
const submitPaymentCollection = async () => {
  // 校验必填项
  if (!paymentCollectionForm.value.student_id ||
      !paymentCollectionForm.value.order_id ||
      paymentCollectionForm.value.payment_scenario === '' ||
      paymentCollectionForm.value.payment_method === '' ||
      !paymentCollectionForm.value.payment_amount ||
      paymentCollectionForm.value.payee_entity === '') {
    alert('请填写所有必填项')
    return
  }

  // 校验线下支付的商户订单号
  if (parseInt(paymentCollectionForm.value.payment_scenario) === 1) {
    if (!paymentCollectionForm.value.merchant_order) {
      alert('请填写商户订单号')
      return
    }
  }

  // 校验付款金额
  const paymentAmount = parseFloat(paymentCollectionForm.value.payment_amount)
  const pendingAmount = parseFloat(paymentCollectionForm.value.pending_amount)
  if (paymentAmount > pendingAmount) {
    alert(`付款金额不能超过待支付金额(${pendingAmount})`)
    return
  }

  // 校验线下支付的交易时间
  if (parseInt(paymentCollectionForm.value.payment_scenario) === 1) {
    if (!paymentCollectionForm.value.trading_hours) {
      alert('请填写交易时间')
      return
    }

    // 检查交易时间是否与订单预计付款时间一致（只比较日期）
    if (selectedOrderInfo.value && selectedOrderInfo.value.expected_payment_time) {
      const tradingDate = new Date(paymentCollectionForm.value.trading_hours)
      const expectedDate = new Date(selectedOrderInfo.value.expected_payment_time)

      const tradingDateStr = tradingDate.toISOString().split('T')[0]
      const expectedDateStr = expectedDate.toISOString().split('T')[0]

      if (tradingDateStr !== expectedDateStr) {
        alert('付款时间与订单不符！请重新填写！')
        return
      }
    }
  }

  try {
    // 处理交易时间格式
    let tradingHours = null
    if (paymentCollectionForm.value.trading_hours) {
      const dateStr = paymentCollectionForm.value.trading_hours
      if (dateStr.length === 10) {
        tradingHours = dateStr + 'T00:00:00Z'
      } else {
        tradingHours = dateStr
      }
    }

    const payload = {
      student_id: parseInt(paymentCollectionForm.value.student_id),
      order_id: parseInt(paymentCollectionForm.value.order_id),
      payment_scenario: parseInt(paymentCollectionForm.value.payment_scenario),
      payment_method: parseInt(paymentCollectionForm.value.payment_method),
      payment_amount: paymentAmount,
      payer: paymentCollectionForm.value.payer,
      payee_entity: parseInt(paymentCollectionForm.value.payee_entity),
      merchant_order: paymentCollectionForm.value.merchant_order || null,
      trading_hours: tradingHours
    }

    const response = await createPaymentCollection(payload)
    if (response.data.code === 0) {
      alert('收款新增成功')
      closeAddPaymentCollectionModal()
      await fetchPaymentCollections()
    } else {
      alert(response.data.message || '新增收款失败')
    }
  } catch (error) {
    console.error('新增收款失败:', error)
    alert(error.response?.data?.message || error.response?.data?.error || '新增收款失败')
  }
}

// 确认到账
const confirmPaymentCollection = (pc) => {
  currentPaymentCollection.value = pc
  showConfirmPaymentModal.value = true
}

// 执行确认到账
const doConfirmPayment = async () => {
  try {
    await confirmPaymentAPI(currentPaymentCollection.value.id)
    alert('已确认到账')
    showConfirmPaymentModal.value = false
    currentPaymentCollection.value = null
    await fetchPaymentCollections()
  } catch (error) {
    console.error('确认到账失败:', error)
    alert(error.response?.data?.message || '确认到账失败')
  }
}

// 确认删除收款
const confirmDeletePaymentCollection = (pc) => {
  currentPaymentCollection.value = pc
  showDeletePaymentModal.value = true
}

// 执行删除收款
const doDeletePayment = async () => {
  try {
    await deletePaymentAPI(currentPaymentCollection.value.id)
    alert('收款已删除')
    showDeletePaymentModal.value = false
    currentPaymentCollection.value = null
    await fetchPaymentCollections()
  } catch (error) {
    console.error('删除收款失败:', error)
    alert(error.response?.data?.message || '删除收款失败')
  }
}

// 确认淘宝到账
const confirmTaobaoArrival = (tp) => {
  currentTaobaoPayment.value = tp
  showConfirmTaobaoModal.value = true
}

// 执行确认淘宝到账
const doConfirmTaobaoArrival = async () => {
  try {
    await confirmTaobaoPayment(currentTaobaoPayment.value.id)
    alert('已确认到账')
    showConfirmTaobaoModal.value = false
    currentTaobaoPayment.value = null
    await fetchTaobaoPayments()
  } catch (error) {
    console.error('确认到账失败:', error)
    alert(error.response?.data?.message || '确认到账失败')
  }
}

// 确认删除淘宝收款
const confirmDeleteTaobaoPayment = (tp) => {
  currentTaobaoPayment.value = tp
  showDeleteTaobaoModal.value = true
}

// 执行删除淘宝收款
const doDeleteTaobaoPayment = async () => {
  try {
    await deleteTaobaoPayment(currentTaobaoPayment.value.id)
    alert('淘宝收款已删除')
    showDeleteTaobaoModal.value = false
    currentTaobaoPayment.value = null
    await fetchTaobaoPayments()
  } catch (error) {
    console.error('删除淘宝收款失败:', error)
    alert(error.response?.data?.message || '删除淘宝收款失败')
  }
}

// 常规待认领相关方法
const searchUnclaimed = () => {
  filteredUnclaimed.value = unclaimedList.value.filter(uc => {
    if (unclaimedFilters.value.id && uc.id != unclaimedFilters.value.id) return false
    if (unclaimedFilters.value.payer && uc.payer !== unclaimedFilters.value.payer) return false
    if (unclaimedFilters.value.payment_method !== '' && uc.payment_method != unclaimedFilters.value.payment_method) return false
    if (unclaimedFilters.value.arrival_date) {
      const arrivalDate = uc.arrival_time ? uc.arrival_time.split('T')[0] : ''
      if (arrivalDate !== unclaimedFilters.value.arrival_date) return false
    }
    if (unclaimedFilters.value.status !== '' && uc.status != unclaimedFilters.value.status) return false
    return true
  })
  unclaimedCurrentPage.value = 1
}

const resetUnclaimedFilters = () => {
  unclaimedFilters.value = {
    id: '',
    payer: '',
    payment_method: '',
    arrival_date: '',
    claimer: '',
    status: ''
  }
  fetchUnclaimedPayments()
}

const changeUnclaimedPage = (page) => {
  unclaimedCurrentPage.value = page
}

const openClaimModal = (uc) => {
  currentUnclaimed.value = uc
  claimForm.value.order_id = ''
  showClaimModal.value = true
}

const doClaimUnclaimed = async () => {
  if (!claimForm.value.order_id) {
    alert('请输入订单ID')
    return
  }

  try {
    await claimUnclaimed(currentUnclaimed.value.id, { order_id: parseInt(claimForm.value.order_id) })
    alert('认领成功')
    showClaimModal.value = false
    currentUnclaimed.value = null
    await fetchUnclaimedPayments()
  } catch (error) {
    console.error('认领失败:', error)
    alert(error.response?.data?.message || '认领失败')
  }
}

const confirmDeleteUnclaimed = (uc) => {
  currentUnclaimed.value = uc
  showDeleteUnclaimedModal.value = true
}

const doDeleteUnclaimed = async () => {
  try {
    await deleteUnclaimed(currentUnclaimed.value.id)
    alert('待认领记录已删除')
    showDeleteUnclaimedModal.value = false
    currentUnclaimed.value = null
    await fetchUnclaimedPayments()
  } catch (error) {
    console.error('删除待认领失败:', error)
    alert(error.response?.data?.message || '删除待认领失败')
  }
}

const onUnclaimedFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    loading.value = true
    const response = await importUnclaimedExcel(formData)
    alert(response.data.message || '导入成功')
    await fetchUnclaimedPayments()
    // 清空文件选择
    event.target.value = ''
  } catch (error) {
    console.error('导入失败:', error)
    alert(error.response?.data?.message || error.response?.data?.error || '导入失败')
  } finally {
    loading.value = false
  }
}

const downloadUnclaimedTemplate = async () => {
  try {
    const response = await downloadUnclaimedTemplateAPI()
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', '待认领收款模板.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('下载模板失败:', error)
    alert('下载模板失败')
  }
}

// 淘宝待认领相关方法
const fetchTaobaoUnclaimedList = async () => {
  loading.value = true
  try {
    const response = await getTaobaoUnclaimed()
    if (response.data && response.data.unclaimed) {
      taobaoUnclaimedList.value = response.data.unclaimed || []
      filteredTaobaoUnclaimed.value = taobaoUnclaimedList.value
    }
  } catch (error) {
    console.error('获取淘宝待认领数据失败:', error)
    alert('获取淘宝待认领数据失败')
  } finally {
    loading.value = false
  }
}

const searchTaobaoUnclaimed = () => {
  filteredTaobaoUnclaimed.value = taobaoUnclaimedList.value.filter(tu => {
    if (taobaoUnclaimedFilters.value.id && tu.id != taobaoUnclaimedFilters.value.id) return false
    if (taobaoUnclaimedFilters.value.arrival_date) {
      const arrivalDate = tu.arrival_time ? tu.arrival_time.split('T')[0] : ''
      if (arrivalDate !== taobaoUnclaimedFilters.value.arrival_date) return false
    }
    if (taobaoUnclaimedFilters.value.status !== '' && tu.status != taobaoUnclaimedFilters.value.status) return false
    return true
  })
  taobaoUnclaimedCurrentPage.value = 1
}

const resetTaobaoUnclaimedFilters = () => {
  taobaoUnclaimedFilters.value = {
    id: '',
    arrival_date: '',
    status: ''
  }
  filteredTaobaoUnclaimed.value = taobaoUnclaimedList.value
  taobaoUnclaimedCurrentPage.value = 1
}

const changeTaobaoUnclaimedPage = (page) => {
  taobaoUnclaimedCurrentPage.value = page
}

const openClaimTaobaoModal = (tu) => {
  currentTaobaoUnclaimed.value = tu
  claimTaobaoForm.value.order_id = ''
  showClaimTaobaoModal.value = true
}

const doClaimTaobaoUnclaimed = async () => {
  if (!claimTaobaoForm.value.order_id) {
    alert('请输入订单ID')
    return
  }

  try {
    await claimTaobaoPayment(currentTaobaoUnclaimed.value.id, { order_id: parseInt(claimTaobaoForm.value.order_id) })
    alert('认领成功')
    showClaimTaobaoModal.value = false
    currentTaobaoUnclaimed.value = null
    await fetchTaobaoUnclaimedList()
  } catch (error) {
    console.error('认领失败:', error)
    alert(error.response?.data?.message || '认领失败')
  }
}

const confirmDeleteTaobaoUnclaimed = (tu) => {
  currentTaobaoUnclaimed.value = tu
  showDeleteTaobaoUnclaimedModal.value = true
}

const doDeleteTaobaoUnclaimed = async () => {
  try {
    await deleteTaobaoUnclaimed(currentTaobaoUnclaimed.value.id)
    alert('淘宝待认领记录已删除')
    showDeleteTaobaoUnclaimedModal.value = false
    currentTaobaoUnclaimed.value = null
    await fetchTaobaoUnclaimedList()
  } catch (error) {
    console.error('删除淘宝待认领失败:', error)
    alert(error.response?.data?.message || '删除淘宝待认领失败')
  }
}

const onTaobaoUnclaimedFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    loading.value = true
    const response = await importTaobaoExcel(formData)
    alert(response.data.message || '导入成功')
    await fetchTaobaoUnclaimedList()
    // 清空文件选择
    event.target.value = ''
  } catch (error) {
    console.error('导入失败:', error)
    alert(error.response?.data?.message || error.response?.data?.error || '导入失败')
  } finally {
    loading.value = false
  }
}

const downloadTaobaoUnclaimedTemplate = async () => {
  try {
    const response = await downloadTaobaoTemplateAPI()
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', '淘宝待认领模板.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('下载模板失败:', error)
    alert('下载模板失败')
  }
}

// 辅助方法
const getPaymentScenarioText = (scenario) => {
  const map = { 0: '线上', 1: '线下' }
  return map[scenario] || '-'
}

const getPaymentMethodText = (method) => {
  const map = { 0: '微信', 1: '支付宝', 2: '优利支付', 3: '零零购支付', 9: '对公转账' }
  return map[method] || '-'
}

const getPayeeEntityText = (entity) => {
  const map = { 0: '北京', 1: '西安' }
  return map[entity] || '-'
}

const getCollectionStatusText = (status) => {
  const map = { 0: '待支付', 10: '未核验', 20: '已支付' }
  return map[status] || '-'
}

const getTaobaoStatusText = (status) => {
  const map = { 0: '已下单', 30: '已到账', 40: '已退单' }
  return map[status] || '-'
}

const getUnclaimedStatusText = (status) => {
  const map = { 0: '待认领', 1: '已认领' }
  return map[status] || '-'
}

const getTaobaoUnclaimedStatusText = (status) => {
  const map = { 10: '待认领', 20: '已认领' }
  return map[status] || '-'
}

const formatDateTime = (datetime) => {
  if (!datetime) return '-'
  return datetime.replace('T', ' ').substring(0, 19)
}

// 生命周期
onMounted(() => {
  fetchPaymentCollections()
})
</script>

<style>
/* 使用全局样式，不使用scoped */
</style>
