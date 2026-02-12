# 变更：前端模块化重构

## 为什么

当前项目是对 CharonOMS 的再开发版本，原项目前端采用单文件架构（index.html 约6000行，app.js 约8200行），所有功能集中在一个HTML文件和一个JavaScript文件中。这种架构在单人开发时尚可维护，但在多人协同开发场景下存在以下问题：

1. **协作冲突**：多个开发者同时修改同一文件会导致频繁的Git合并冲突
2. **代码可读性差**：超大文件难以快速定位和理解特定功能
3. **维护困难**：功能耦合严重，修改一个功能可能影响其他功能
4. **复用性低**：组件和逻辑无法独立复用

本次重构的目标是将单文件前端拆分为多文件模块化架构，同时保持后端代码和数据库结构不变，确保前后端接口兼容性。

## 变更内容

### 前端架构重构
- 将单一 HTML 文件拆分为模块化的组件结构
- 将单一 JavaScript 文件按功能域拆分为独立模块
- 引入前端构建工具和模块化规范
- 保持 Vue.js 3 技术栈不变
- 确保所有 API 调用与后端接口完全兼容

### 目录结构规划
```
frontend/
├── public/                    # 静态资源
│   ├── index.html            # 单页面入口
│   └── styles.css            # 全局样式
├── src/                       # 源代码
│   ├── main.js               # 应用入口
│   ├── App.vue               # 根组件
│   ├── api/                  # API 接口层
│   │   ├── auth.js           # 认证接口
│   │   ├── student.js        # 学生管理接口
│   │   ├── coach.js          # 教练管理接口
│   │   ├── order.js          # 订单接口
│   │   ├── goods.js          # 商品接口
│   │   ├── account.js        # 账号接口
│   │   └── rbac.js           # 权限接口
│   ├── components/           # 公共组件
│   │   ├── common/           # 通用组件
│   │   │   ├── Modal.vue     # 模态框组件
│   │   │   ├── Table.vue     # 表格组件
│   │   │   ├── Pagination.vue # 分页组件
│   │   │   └── Loading.vue   # 加载组件
│   │   └── layout/           # 布局组件
│   │       ├── Header.vue    # 顶部导航
│   │       ├── Sidebar.vue   # 侧边栏菜单
│   │       └── MainContent.vue # 主内容区
│   ├── views/                # 页面视图
│   │   ├── Login.vue         # 登录页
│   │   ├── StudentManagement.vue    # 学生管理
│   │   ├── CoachManagement.vue      # 教练管理
│   │   ├── OrderManagement.vue      # 订单管理
│   │   ├── GoodsManagement.vue      # 商品管理
│   │   ├── AccountManagement.vue    # 账号管理
│   │   └── RBACManagement.vue       # 权限管理
│   ├── store/                # 状态管理
│   │   ├── index.js          # Store 入口
│   │   ├── modules/          # 模块
│   │   │   ├── auth.js       # 认证状态
│   │   │   ├── user.js       # 用户状态
│   │   │   └── permission.js # 权限状态
│   │   └── actions.js        # 全局 actions
│   ├── utils/                # 工具函数
│   │   ├── request.js        # Axios 封装
│   │   ├── auth.js           # 认证工具
│   │   └── helpers.js        # 辅助函数
│   └── router/               # 路由配置
│       └── index.js          # 路由定义
├── package.json              # 项目配置
├── vite.config.js            # Vite 构建配置
└── README.md                 # 前端说明文档
```

### 技术选型
- **构建工具**：Vite（快速、现代化）
- **状态管理**：Pinia（Vue 3 官方推荐）
- **路由管理**：Vue Router 4
- **HTTP 客户端**：Axios（保持与原项目一致）
- **模块规范**：ES Modules

## 影响

### 受影响规范
- 新增功能：`frontend-architecture`（前端架构规范）

### 受影响代码
- **前端文件**：
  - `frontend/index.html`（将被拆分）
  - `frontend/app.js`（将被拆分）
  - `frontend/styles.css`（将被重新组织）

- **后端文件**：
  - **无影响**：后端代码和数据库结构保持不变
  - **兼容性要求**：所有 API 接口路径、请求格式、响应格式必须保持不变

### 迁移路径
1. 第一阶段：搭建前端项目脚手架和基础设施
2. 第二阶段：将认证和登录功能模块化
3. 第三阶段：逐个迁移业务模块（学生、教练、订单等）
4. 第四阶段：整合测试和优化

### 风险评估
- **低风险**：后端不变，仅前端重构
- **兼容性测试**：需要充分测试所有 API 调用
- **回滚方案**：保留原前端代码作为备份

### 非目标
- **不修改后端**：所有后端 handler、service、repository 保持不变
- **不修改数据库**：数据库表结构和字段定义保持不变
- **不改变功能**：仅重构代码结构，不新增或删除业务功能
- **不改变用户体验**：UI/UX 保持一致，仅代码组织方式改变
