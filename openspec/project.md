# 项目 上下文

## 目的

OMS-GO 是对 CharonOMS 项目的再开发版本，是一个基于 DDD 分层架构的订单管理系统。本项目的核心目标是：

1. **前端模块化重构**：将原项目的单文件前端架构（index.html 6038行 + app.js 8210行）拆分为模块化的多文件架构
2. **支持多人协作开发**：通过模块化降低代码冲突，提高团队协作效率
3. **保持后端稳定**：后端代码（Go + Gin + GORM）和数据库结构完全不变
4. **功能等价性**：重构后的系统功能与原版完全一致

## 技术栈

### 后端（不可修改）
- **语言**：Go 1.21+
- **Web 框架**：Gin
- **ORM**：GORM
- **数据库**：MySQL 5.7+
- **认证**：JWT
- **日志**：Zap
- **配置**：Viper

### 前端（重构目标）
- **框架**：Vue.js 3
- **构建工具**：Vite
- **状态管理**：Pinia
- **路由管理**：Vue Router 4
- **HTTP 客户端**：Axios
- **模块规范**：ES Modules
- **语言**：JavaScript（未来可考虑 TypeScript）

## 项目约定

### 代码风格

#### 前端
- **组件命名**：使用 PascalCase（如 `StudentManagement.vue`）
- **JS 文件命名**：使用 camelCase（如 `request.js`、`auth.js`）
- **代码格式**：使用 ESLint 进行代码检查
- **缩进**：2 空格
- **引号**：单引号
- **注释**：复杂逻辑必须添加注释，API 函数需要 JSDoc 注释

#### 后端（参考）
- 遵循 Go 官方代码规范
- 使用 `gofmt` 格式化代码
- 导出的函数和结构体必须添加注释

### 架构模式

#### 后端架构（DDD 分层，不可修改）
```
internal/
├── interfaces/       # 接口层（API Handler）
├── application/      # 应用层（Application Service）
├── domain/          # 领域层（Entity, Repository, Domain Service）
└── infrastructure/   # 基础设施层（Persistence, Config, Logger）
```

#### 前端架构（重构目标）
```
src/
├── api/             # API 接口层（按业务模块拆分）
├── components/      # 组件层（通用组件和布局组件）
├── views/           # 页面视图层（对应路由页面）
├── store/           # 状态管理层（Pinia Stores）
├── utils/           # 工具层（通用工具函数）
└── router/          # 路由配置层
```

### 测试策略

- **当前状态**：原项目没有前端测试
- **短期目标**：优先完成功能迁移，确保功能等价性
- **长期目标**：逐步添加关键模块的单元测试和集成测试
- **测试方法**：
  - 功能测试：手动测试所有 CRUD 操作
  - 兼容性测试：验证所有 API 调用与后端接口匹配
  - 权限测试：验证不同角色的权限控制
  - UI/UX 测试：与原版对比，确保界面一致性

### Git 工作流

#### 分支策略
- **main**：主分支，保持稳定
- **feature/frontend-refactor**：前端重构开发分支
- **feature/module-xxx**：单个模块开发分支（可选，用于并行开发）

#### 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试
chore: 构建/工具变动
```

#### 提交示例
```
feat(frontend): 实现学生管理页面组件化
refactor(frontend): 将登录逻辑迁移到 Pinia Store
fix(frontend): 修复权限检查逻辑错误
```

## 领域上下文

### 业务模块

1. **学生管理**：管理学生信息（ID、姓名、年级、状态等）
2. **教练管理**：管理教练信息（ID、姓名、性别、科目、状态等）
3. **订单管理**：管理订单和子订单（订单 ID、用户 ID、商品 ID、状态等）
4. **商品管理**：管理商品、品牌、分类、属性
5. **账号管理**：管理系统账号、角色分配
6. **权限管理**：RBAC 权限系统（角色、权限、菜单）
7. **活动管理**：管理营销活动（待实现）
8. **合同管理**：管理学生合同（待实现）
9. **收款/退款管理**：财务管理（待实现）
10. **审批流程**：审批工作流（待实现）

### RBAC 权限系统

- **角色（Role）**：定义不同的系统角色
- **权限（Permission）**：定义具体的操作权限（如 `add_student`、`edit_student`）
- **菜单（Menu）**：动态菜单树，根据角色显示不同菜单
- **超级管理员**：拥有所有权限，不受权限控制
- **权限检查**：通过 `enabledPermissions` 列表判断用户是否有权限执行操作

### 认证流程

1. 用户在登录页输入用户名和密码
2. 前端调用 `POST /api/login` 接口
3. 后端验证凭据，返回 JWT Token
4. 前端将 Token 存储在 `localStorage`
5. 后续请求自动在请求头中携带 `Authorization: Bearer {token}`
6. 后端验证 Token，返回数据
7. 如果 Token 过期或无效，后端返回 401 错误
8. 前端拦截 401 错误，清除 Token 并重定向到登录页

## 重要约束

### 技术约束

1. **后端代码不可修改**：所有后端 handler、service、repository 代码保持不变
2. **数据库结构不可修改**：MySQL 数据库表结构、字段、索引保持不变
3. **API 接口不可修改**：HTTP 接口的路径、请求格式、响应格式必须保持一致
4. **Vue 3 技术栈**：前端必须使用 Vue 3，不能更换为其他框架（如 React、Angular）
5. **Axios 保留**：继续使用 Axios 作为 HTTP 客户端，保持与原项目一致

### 业务约束

1. **功能等价性**：重构后的前端必须提供与原版完全一致的功能
2. **UI/UX 一致性**：用户界面和交互体验必须与原版一致
3. **权限控制一致性**：权限检查逻辑必须与原版一致
4. **数据格式一致性**：所有数据展示和提交格式必须与原版一致

### 开发约束

1. **渐进式迁移**：必须按阶段迁移，不能一次性全部重写
2. **可回滚**：每个阶段完成后必须可以独立验证和回滚
3. **并行开发**：设计应支持多人同时开发不同模块
4. **代码可维护性**：代码必须清晰、可读、易于维护

## 外部依赖

### CDN 依赖（原项目）
- Vue 3：`https://unpkg.com/vue@3/dist/vue.global.prod.js`
- Axios：`https://unpkg.com/axios/dist/axios.min.js`

### NPM 依赖（重构后）
- `vue@3.x`：核心框架
- `vue-router@4.x`：路由管理
- `pinia@2.x`：状态管理
- `axios@1.x`：HTTP 客户端
- `vite@5.x`：构建工具

### 后端服务
- **地址**：`http://localhost:5001`
- **API 前缀**：`/api`
- **认证方式**：JWT Token（Bearer Token）

### 数据库
- **类型**：MySQL 5.7+
- **数据库名**：charonoms
- **字符集**：utf8mb4
- **排序规则**：utf8mb4_unicode_ci

## 项目文件结构

### 当前状态（原项目）
```
CharonOMS/
├── frontend/
│   ├── index.html      # 6038 行，包含所有 HTML 模板
│   ├── app.js          # 8210 行，包含所有业务逻辑
│   └── styles.css      # 1794 行，全局样式
```

### 目标状态（重构后）
```
OMS-GO/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── styles.css
│   ├── src/
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── api/
│   │   ├── components/
│   │   ├── views/
│   │   ├── store/
│   │   ├── utils/
│   │   └── router/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
```

## 关键设计决策

1. **构建工具选择 Vite**：快速、简洁、与 Vue 3 集成度高
2. **状态管理选择 Pinia**：Vue 3 官方推荐，API 简洁
3. **路由管理选择 Vue Router 4**：Vue 官方路由，功能完善
4. **目录结构采用分层架构**：职责分离，便于协作
5. **API 接口按业务模块拆分**：与后端结构一致，便于对照
6. **保留全局样式**：确保样式与原版一致
7. **使用 Hash 路由模式**：避免修改后端路由配置

## 参考资源

- **原项目**：`D:\claude space\CharonOMS`
- **后端代码**：`D:\claude space\CharonOMS\internal`
- **原前端代码**：`D:\claude space\CharonOMS\frontend`
- **API 文档**：`D:\claude space\CharonOMS\README.md`
