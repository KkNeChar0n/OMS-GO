<template>
  <!-- 审批详情抽屉 -->
  <div class="drawer-overlay" @click="$emit('close')">
    <div class="drawer" @click.stop>
      <div class="drawer-header">
        <h3>审批详情</h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      <div class="drawer-body" v-if="detail">
        <!-- 第一行：ID和审批流ID -->
        <div class="form-group-row">
          <div class="form-group">
            <label>ID</label>
            <input type="text" :value="detail.id" readonly>
          </div>
          <div class="form-group">
            <label>审批流ID</label>
            <input type="text" :value="detail.approval_flow_management_id" readonly>
          </div>
        </div>

        <!-- 第二行：审批流类型、发起人、发起时间 -->
        <div class="form-group-row">
          <div class="form-group">
            <label>审批流类型</label>
            <input type="text" :value="detail.flow_info?.approval_flow_type_name || detail.flow_type_name" readonly>
          </div>
          <div class="form-group">
            <label>发起人</label>
            <input type="text" :value="detail.flow_info?.creator_name" readonly>
          </div>
          <div class="form-group">
            <label>发起时间</label>
            <input type="text" :value="detail.create_time" readonly>
          </div>
        </div>

        <!-- 第三行：审批流程数轴 -->
        <div style="margin: 30px 0;">
          <label style="display: block; margin-bottom: 15px; font-weight: bold; color: #333;">审批流程</label>
          <div style="display: flex; align-items: center; position: relative; padding: 0 20px;">
            <!-- 连接线 -->
            <div style="position: absolute; top: 15px; left: 30px; right: 30px; height: 2px; background-color: #e8e8e8; z-index: 1;"></div>

            <!-- 节点 -->
            <div v-for="(node, index) in detail.all_nodes" :key="node.template_node_id"
                 style="flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; z-index: 2;">
              <!-- 节点圆点 -->
              <div :style="{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: getNodeColor(node),
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }">
                {{ index + 1 }}
              </div>
              <!-- 节点名称 -->
              <div style="margin-top: 8px; font-size: 12px; text-align: center; color: #666;">
                {{ node.node_name }}
              </div>
              <!-- 节点状态 -->
              <div style="margin-top: 4px; font-size: 11px; text-align: center;"
                   :style="{ color: getNodeColor(node) }">
                {{ getNodeStatusText(node) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 第四行：审批内容（退费类型） -->
        <div v-if="detail.refund_order_info" style="margin-top: 20px;">
          <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #333;">审批内容</label>

          <!-- 退费基本信息 -->
          <div class="form-group-row">
            <div class="form-group">
              <label>退费ID</label>
              <input type="text" :value="detail.refund_order_info.refund_order_id" readonly>
            </div>
            <div class="form-group">
              <label>退费金额</label>
              <input type="text" :value="'￥' + detail.refund_order_info.refund_amount" readonly style="color: #f56c6c; font-weight: bold;">
            </div>
          </div>

          <!-- 退费商品（待退费区） -->
          <div class="form-group" v-if="detail.refund_order_info.items && detail.refund_order_info.items.length > 0">
            <label>退费商品</label>
            <table class="data-table" style="margin-top: 5px;">
              <thead>
                <tr>
                  <th>商品名称</th>
                  <th style="width: 150px; text-align: right;">退费金额</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in detail.refund_order_info.items" :key="item.goods_name">
                  <td>{{ item.goods_name }}</td>
                  <td style="text-align: right;">￥{{ item.refund_amount }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 退费途径（收款列表） -->
          <div class="form-group" v-if="detail.refund_order_info.payments && detail.refund_order_info.payments.length > 0">
            <label>退费途径</label>
            <table class="data-table" style="margin-top: 5px;">
              <thead>
                <tr>
                  <th>收款ID</th>
                  <th>收款类型</th>
                  <th>收款主体</th>
                  <th style="width: 120px; text-align: right;">原收款金额</th>
                  <th style="width: 120px; text-align: right;">退费金额</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in detail.refund_order_info.payments" :key="payment.payment_id">
                  <td>{{ payment.payment_id }}</td>
                  <td>{{ payment.payment_type === 0 ? '常规收款' : '淘宝收款' }}</td>
                  <td>{{ payment.payee_entity === null ? '-' : (payment.payee_entity === 0 ? '北京' : '西安') }}</td>
                  <td style="text-align: right;">￥{{ payment.payment_amount }}</td>
                  <td style="text-align: right; color: #f56c6c; font-weight: bold;">￥{{ payment.refund_amount }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 退费信息补充 -->
          <div v-if="detail.refund_order_info.taobao_supplement || (detail.refund_order_info.regular_supplements && detail.refund_order_info.regular_supplements.length > 0)" style="margin-top: 20px;">
            <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #333;">退费信息补充</label>

            <!-- 淘宝退费 -->
            <div v-if="detail.refund_order_info.taobao_supplement">
              <h5 style="font-size: 14px; font-weight: 600; margin-bottom: 10px;">淘宝退费</h5>
              <div class="form-group-row">
                <div class="form-group-col">
                  <label>支付宝账号</label>
                  <input type="text" :value="detail.refund_order_info.taobao_supplement.alipay_account" readonly class="readonly-input">
                </div>
                <div class="form-group-col">
                  <label>支付宝名称</label>
                  <input type="text" :value="detail.refund_order_info.taobao_supplement.alipay_name" readonly class="readonly-input">
                </div>
                <div class="form-group-col">
                  <label>退费金额</label>
                  <input type="text" :value="'￥' + detail.refund_order_info.taobao_supplement.refund_amount" readonly class="readonly-input" style="font-weight: bold; color: #e74c3c;">
                </div>
              </div>
            </div>

            <!-- 常规退费 -->
            <div v-if="detail.refund_order_info.regular_supplements && detail.refund_order_info.regular_supplements.length > 0" :style="{marginTop: detail.refund_order_info.taobao_supplement ? '15px' : '0'}">
              <h5 style="font-size: 14px; font-weight: 600; margin-bottom: 10px;">常规退费</h5>
              <div v-for="(item, index) in detail.refund_order_info.regular_supplements" :key="index" style="margin-bottom: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 4px;">
                <div style="margin-bottom: 8px; font-weight: 600; color: #666; font-size: 13px;">
                  <span>{{ item.payee_entity === 0 ? '北京' : '西安' }}</span>
                  <span style="margin-left: 10px;">{{ item.is_corporate_transfer === 1 ? '对公转账' : '非对公转账' }}</span>
                </div>
                <div class="form-group-row">
                  <div class="form-group-col">
                    <label>付款方</label>
                    <input type="text" :value="item.payer || '-'" readonly class="readonly-input">
                  </div>
                  <div class="form-group-col">
                    <label>银行账户</label>
                    <input type="text" :value="item.bank_account || '-'" readonly class="readonly-input">
                  </div>
                  <div class="form-group-col">
                    <label>退款金额</label>
                    <input type="text" :value="'￥' + item.refund_amount" readonly class="readonly-input" style="font-weight: bold; color: #e74c3c;">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="drawer-footer" v-if="detail && detail.result === null">
        <button class="cancel-btn" @click="$emit('reject')">驳回</button>
        <button class="save-btn" @click="$emit('approve')">通过</button>
      </div>
      <div class="drawer-footer" v-else>
        <button class="cancel-btn" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApprovalDetailDrawer',
  props: {
    detail: {
      type: Object,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'approve', 'reject'],
  methods: {
    getNodeColor(node) {
      // node_result: 0=已通过, 1=已驳回, null=待审批
      // node_case_id存在且node_result为null表示审批中
      if (node.node_result === 0) return '#52c41a' // 绿色-已通过
      if (node.node_result === 1) return '#f56c6c' // 红色-已驳回
      if (node.node_case_id && node.node_result === null) return '#1890ff' // 蓝色-审批中
      return '#bfbfbf' // 灰色-未开始
    },
    getNodeStatusText(node) {
      if (node.node_result === 0) return '已通过'
      if (node.node_result === 1) return '已驳回'
      if (node.node_case_id && node.node_result === null) return '审批中'
      return '未开始'
    }
  }
}
</script>

<style scoped>
/* 抽屉遮罩层 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 2000;
}

/* 抽屉主体 */
.drawer {
  background: white;
  width: 50%;
  height: 100%;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
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

/* 抽屉头部 */
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

/* 关闭按钮 */
.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

/* 抽屉内容区 */
.drawer-body {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

/* 抽屉底部 */
.drawer-footer {
  padding: 20px 30px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #f8f9fa;
}

/* 表单行布局 */
.form-group-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

/* 表单组 */
.form-group {
  flex: 1;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #666;
}

/* 表单列布局（三列） */
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

.form-group-col input {
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

/* 数据表格 */
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #333;
}

.data-table tbody tr:hover {
  background-color: #f8f9fa;
}

/* 按钮样式 */
.cancel-btn,
.save-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.cancel-btn {
  background-color: #95a5a6;
  color: white;
}

.cancel-btn:hover {
  background-color: #7f8c8d;
}

.save-btn {
  background-color: #27ae60;
  color: white;
}

.save-btn:hover {
  background-color: #229954;
}
</style>
