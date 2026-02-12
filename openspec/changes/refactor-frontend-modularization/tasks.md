# 实施任务清单

## 1. 项目基础设施搭建
- [x] 1.1 初始化 Vite + Vue 3 项目脚手架
- [x] 1.2 配置 package.json 依赖（Vue Router、Pinia、Axios）
- [x] 1.3 配置 vite.config.js（开发服务器代理、构建输出）
- [x] 1.4 创建项目目录结构（src/api、components、views、store、utils、router）
- [ ] 1.5 配置 ESLint 和代码格式化规则
- [x] 1.6 创建前端 README.md 说明文档

## 2. 公共基础设施层
- [x] 2.1 实现 Axios 请求封装（utils/request.js）
  - [x] 2.1.1 配置请求拦截器（自动添加 JWT Token）
  - [x] 2.1.2 配置响应拦截器（处理 401 错误）
  - [x] 2.1.3 统一错误处理机制
- [x] 2.2 实现认证工具函数（utils/auth.js）
  - [x] 2.2.1 Token 存储和读取
  - [x] 2.2.2 登录状态检查
  - [x] 2.2.3 权限检查函数
- [x] 2.3 创建通用辅助函数（utils/helpers.js）
  - [x] 2.3.1 日期格式化
  - [x] 2.3.2 数据筛选和分页逻辑

## 3. 状态管理层（Pinia Store）
- [x] 3.1 创建 Store 入口文件（store/index.js）
- [x] 3.2 实现认证状态模块（store/modules/auth.js）
  - [x] 3.2.1 用户登录状态
  - [x] 3.2.2 是否超级管理员标识
  - [x] 3.2.3 登录、登出、角色同步 actions
- [x] 3.3 实现用户状态模块（store/modules/user.js）
  - [x] 3.3.1 用户名存储
  - [x] 3.3.2 用户信息获取
- [x] 3.4 实现权限状态模块（store/modules/permission.js）
  - [x] 3.4.1 启用权限列表
  - [x] 3.4.2 菜单树数据
  - [x] 3.4.3 权限检查方法

## 4. API 接口层
- [x] 4.1 实现认证接口（api/auth.js）
  - [x] 4.1.1 登录接口 POST /api/login
  - [x] 4.1.2 登出接口 POST /api/logout
  - [x] 4.1.3 获取用户信息 GET /api/profile
  - [x] 4.1.4 同步角色 GET /api/sync-role
- [x] 4.2 实现学生管理接口（api/student.js）
  - [x] 4.2.1 获取学生列表 GET /api/students
  - [x] 4.2.2 新增学生 POST /api/students
  - [x] 4.2.3 更新学生 PUT /api/students/:id
  - [x] 4.2.4 删除学生 DELETE /api/students/:id
- [x] 4.3 实现教练管理接口（api/coach.js）
  - [x] 4.3.1 获取教练列表 GET /api/coaches
  - [x] 4.3.2 新增教练 POST /api/coaches
  - [x] 4.3.3 更新教练 PUT /api/coaches/:id
  - [x] 4.3.4 删除教练 DELETE /api/coaches/:id
- [x] 4.4 实现订单管理接口（api/order.js）
  - [x] 4.4.1 获取订单列表 GET /api/orders
  - [x] 4.4.2 新增订单 POST /api/orders
  - [x] 4.4.3 更新订单 PUT /api/orders/:id
  - [x] 4.4.4 获取子订单列表
- [x] 4.5 实现商品管理接口（api/goods.js）
  - [x] 4.5.1 获取商品列表 GET /api/goods
  - [x] 4.5.2 新增商品 POST /api/goods
  - [x] 4.5.3 更新商品 PUT /api/goods/:id
  - [x] 4.5.4 获取品牌、分类、属性接口
- [x] 4.6 实现账号管理接口（api/account.js）
  - [x] 4.6.1 获取账号列表 GET /api/accounts
  - [x] 4.6.2 新增账号 POST /api/accounts
  - [x] 4.6.3 更新账号 PUT /api/accounts/:id
  - [x] 4.6.4 删除账号 DELETE /api/accounts/:id
- [x] 4.7 实现 RBAC 权限接口（api/rbac.js）
  - [x] 4.7.1 获取角色列表 GET /api/roles
  - [x] 4.7.2 获取权限列表 GET /api/permissions
  - [x] 4.7.3 获取菜单树 GET /api/menu-tree
  - [x] 4.7.4 角色权限管理接口

## 5. 公共组件开发
- [x] 5.1 通用组件
  - [x] 5.1.1 模态框组件（components/common/Modal.vue）
  - [ ] 5.1.2 表格组件（components/common/Table.vue）
  - [x] 5.1.3 分页组件（components/common/Pagination.vue）
  - [x] 5.1.4 加载组件（components/common/Loading.vue）
- [ ] 5.2 布局组件
  - [ ] 5.2.1 顶部导航组件（components/layout/Header.vue）
  - [ ] 5.2.2 侧边栏菜单组件（components/layout/Sidebar.vue）
  - [ ] 5.2.3 主内容区组件（components/layout/MainContent.vue）

## 6. 路由配置
- [x] 6.1 创建路由配置文件（router/index.js）
- [x] 6.2 配置登录页路由
- [x] 6.3 配置主应用路由（嵌套路由）
- [x] 6.4 配置业务模块路由
  - [x] 6.4.1 学生管理路由
  - [x] 6.4.2 教练管理路由
  - [x] 6.4.3 订单管理路由
  - [x] 6.4.4 商品管理路由
  - [x] 6.4.5 账号管理路由
  - [x] 6.4.6 权限管理路由
- [x] 6.5 实现路由守卫（登录状态检查）

## 7. 页面视图开发
- [x] 7.1 登录页面（views/Login.vue）
  - [x] 7.1.1 登录表单实现
  - [x] 7.1.2 登录逻辑和错误处理
  - [x] 7.1.3 样式迁移
- [x] 7.2 学生管理页面（views/StudentManagement.vue）
  - [x] 7.2.1 学生列表展示
  - [x] 7.2.2 筛选表单
  - [x] 7.2.3 新增/编辑学生弹窗
  - [x] 7.2.4 删除学生功能
  - [x] 7.2.5 分页功能
- [x] 7.3 教练管理页面（views/CoachManagement.vue）（占位符）
  - [ ] 7.3.1 教练列表展示
  - [ ] 7.3.2 筛选表单
  - [ ] 7.3.3 新增/编辑教练弹窗
  - [ ] 7.3.4 删除教练功能
  - [ ] 7.3.5 分页功能
- [x] 7.4 订单管理页面（views/OrderManagement.vue）（占位符）
  - [ ] 7.4.1 订单列表展示
  - [ ] 7.4.2 子订单管理
  - [ ] 7.4.3 新增/编辑订单弹窗
  - [ ] 7.4.4 订单状态管理
- [x] 7.5 商品管理页面（views/GoodsManagement.vue）（占位符）
  - [ ] 7.5.1 商品列表展示
  - [ ] 7.5.2 品牌、分类、属性管理
  - [ ] 7.5.3 新增/编辑商品弹窗
  - [ ] 7.5.4 商品状态管理
- [x] 7.6 账号管理页面（views/AccountManagement.vue）（占位符）
  - [ ] 7.6.1 账号列表展示
  - [ ] 7.6.2 新增/编辑账号弹窗
  - [ ] 7.6.3 角色分配
  - [ ] 7.6.4 账号状态管理
- [x] 7.7 权限管理页面（views/RBACManagement.vue）（占位符）
  - [ ] 7.7.1 角色管理
  - [ ] 7.7.2 权限管理
  - [ ] 7.7.3 菜单管理
  - [ ] 7.7.4 角色权限配置

## 8. 根组件和应用入口
- [x] 8.1 创建 App.vue 根组件
  - [x] 8.1.1 登录/主应用视图切换逻辑
  - [x] 8.1.2 全局 Loading 状态
  - [x] 8.1.3 角色同步逻辑
- [x] 8.2 创建 main.js 入口文件
  - [x] 8.2.1 Vue 应用初始化
  - [x] 8.2.2 挂载 Router、Store
  - [ ] 8.2.3 全局组件注册
- [x] 8.3 创建 index.html
  - [x] 8.3.1 基础 HTML 结构
  - [x] 8.3.2 引入全局样式

## 9. 样式迁移
- [x] 9.1 迁移全局样式（public/styles.css）
- [ ] 9.2 组件样式模块化（Scoped CSS）
- [ ] 9.3 样式变量提取（CSS Variables）

## 10. 构建配置和集成
- [x] 10.1 配置开发服务器代理（proxy to localhost:5001）
- [x] 10.2 配置生产构建输出目录（dist -> backend/frontend）
- [x] 10.3 配置静态资源处理
- [ ] 10.4 后端静态文件服务配置更新（指向新的构建输出）

## 11. 测试和验证
- [ ] 11.1 功能测试
  - [ ] 11.1.1 登录/登出功能测试
  - [ ] 11.1.2 学生管理 CRUD 测试
  - [ ] 11.1.3 教练管理 CRUD 测试
  - [ ] 11.1.4 订单管理功能测试
  - [ ] 11.1.5 商品管理功能测试
  - [ ] 11.1.6 账号管理功能测试
  - [ ] 11.1.7 权限管理功能测试
- [ ] 11.2 兼容性测试
  - [ ] 11.2.1 验证所有 API 调用与后端接口匹配
  - [ ] 11.2.2 验证请求格式和响应处理
  - [ ] 11.2.3 验证认证流程
- [ ] 11.3 权限测试
  - [ ] 11.3.1 超级管理员权限测试
  - [ ] 11.3.2 普通用户权限限制测试
  - [ ] 11.3.3 菜单显示权限测试
- [ ] 11.4 UI/UX 一致性验证
  - [ ] 11.4.1 界面布局与原版对比
  - [ ] 11.4.2 交互流程与原版对比
  - [ ] 11.4.3 错误提示与原版对比

## 12. 文档和部署
- [ ] 12.1 编写前端 README.md
  - [ ] 12.1.1 项目结构说明
  - [ ] 12.1.2 开发指南
  - [ ] 12.1.3 构建和部署说明
- [ ] 12.2 编写 API 接口文档
- [ ] 12.3 配置生产环境构建脚本
- [ ] 12.4 更新主项目 README.md（前端部分）
- [ ] 12.5 备份原前端代码
- [ ] 12.6 执行最终部署

## 依赖关系说明
- 任务 2-4 可并行开发（公共基础设施、状态管理、API 接口）
- 任务 5 依赖任务 2（公共组件需要使用工具函数）
- 任务 6 依赖任务 3（路由守卫需要状态管理）
- 任务 7 依赖任务 2-6（页面开发需要所有基础设施）
- 任务 8 依赖任务 3、6（应用入口需要状态管理和路由）
- 任务 10 依赖任务 1-9 完成
- 任务 11 依赖任务 1-10 完成
- 任务 12 依赖任务 11 完成
