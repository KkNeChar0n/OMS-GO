# OMS-GO 部署和测试指南

## 项目概述

本项目是 CharonOMS 的模块化重构版本，采用：
- **后端**：Go + Gin + GORM + MySQL（与原项目完全相同）
- **前端**：Vue 3 + Vite + Pinia + Vue Router（模块化架构）

## 项目结构

```
OMS-GO/
├── cmd/                    # 后端入口
├── internal/               # 后端业务逻辑
├── pkg/                    # 公共包
├── config/                 # 配置文件
├── frontend/           # 前端源代码
│   ├── src/               # Vue 源代码
│   ├── package.json       # 前端依赖
│   └── vite.config.js     # 构建配置
├── frontend-dist/          # 前端构建产物（生产部署）
├── server.exe             # 后端可执行文件
└── go.mod                 # Go 依赖
```

## 环境要求

### 后端
- Go 1.21+
- MySQL 5.7+

### 前端
- Node.js 18+
- npm 或 yarn

## 配置步骤

### 1. 数据库配置

修改 `config/config.yaml`：

```yaml
database:
  host: "localhost"
  port: 3306
  user: "root"
  password: "你的密码"  # 修改为实际密码
  database: "omsgo"
```

**注意**：确保数据库 `charonoms` 已创建并包含所需的表结构。

### 2. 后端配置

其他配置项（JWT、Logger、CORS）保持默认即可。

```yaml
server:
  port: "5001"
  mode: "debug"  # 生产环境改为 "release"

jwt:
  secret: "your-secret-key-change-this-in-production"  # 生产环境修改
  expire_hours: 24

cors:
  allow_origins:
    - "http://localhost"
    - "http://127.0.0.1"
```

## 开发环境运行

### 方式 1：前端开发模式 + 后端服务器

**适用场景**：前端开发、调试

1. **启动后端服务器**
```bash
cd D:\claude space\OMS-GO
./server.exe
```

后端启动在: http://localhost:5001

2. **启动前端开发服务器**（新终端）
```bash
cd D:\claude space\OMS-GO\frontend
npm run dev
```

前端启动在: http://localhost:5173

前端开发服务器会自动代理 `/api` 请求到后端（localhost:5001）。

**优点**：
- 热模块替换（HMR）
- 快速重载
- 适合前端开发

### 方式 2：仅后端服务器（生产模式）

**适用场景**：生产部署、集成测试

1. **构建前端**（如果有修改）
```bash
cd D:\claude space\OMS-GO\frontend
npm run build
```

构建产物输出到: `../frontend-dist/`

2. **启动后端服务器**
```bash
cd D:\claude space\OMS-GO
./server.exe
```

3. **访问应用**

打开浏览器访问: http://localhost:5001

后端会自动提供前端静态文件。

**优点**：
- 真实生产环境
- 前后端完全集成
- 适合最终测试

## 测试指南

### 1. 登录测试

1. 访问 http://localhost:5001（或 http://localhost:5173 开发模式）
2. 输入用户名和密码
3. 点击登录

**预期结果**：
- 登录成功，跳转到主页
- 显示用户名和菜单

### 2. 学生管理测试

1. 点击侧边栏"学生管理"
2. 测试以下功能：
   - ✅ 查看学生列表
   - ✅ 使用筛选功能（ID、姓名、年级、状态）
   - ✅ 点击"新增学生"，填写表单，提交
   - ✅ 点击"编辑"按钮，修改学生信息
   - ✅ 点击"删除"按钮，删除学生
   - ✅ 使用分页功能

**预期结果**：
- 所有 CRUD 操作正常
- 数据实时更新
- 权限控制正确（按钮显示/隐藏）

### 3. 其他模块测试

测试其他菜单项：
- 教练管理（占位页面）
- 订单管理（占位页面）
- 商品管理（占位页面）
- 账号管理（占位页面）
- 权限管理（占位页面）

**预期结果**：
- 菜单可正常切换
- 显示"功能开发中..."页面

### 4. 权限测试

1. 使用不同角色的账号登录
2. 验证按钮和菜单的显示/隐藏

**预期结果**：
- 超级管理员：所有按钮可见
- 普通用户：根据权限显示按钮

### 5. 登出测试

1. 点击右上角"登出"按钮
2. 确认返回登录页

## 常见问题

### 1. 后端启动失败

**错误**：`Failed to init database`

**解决**：
- 检查 MySQL 是否运行
- 检查 `config/config.yaml` 中的数据库配置
- 确保数据库 `charonoms` 已创建

### 2. 前端无法连接后端

**错误**：API 请求 404 或超时

**解决**：
- 确认后端已启动（http://localhost:5001）
- 检查 `frontend/vite.config.js` 中的代理配置
- 检查浏览器控制台的错误信息

### 3. 登录后 401 错误

**原因**：Token 过期或无效

**解决**：
- 清除浏览器 localStorage
- 重新登录

### 4. 前端构建失败

**错误**：npm run build 失败

**解决**：
```bash
cd frontend
rm -rf node_modules
npm install
npm run build
```

## 生产部署

### 1. 构建前端

```bash
cd frontend
npm run build
```

### 2. 编译后端

```bash
go build -o server cmd/server/main.go
```

### 3. 部署文件

需要部署的文件：
```
server.exe          # 后端可执行文件
config/             # 配置目录
frontend-dist/      # 前端构建产物
```

### 4. 启动服务

```bash
./server
```

### 5. 配置反向代理（可选）

使用 Nginx 配置反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 性能优化

### 前端优化

1. **启用 gzip 压缩**
   - Nginx 配置 gzip
   - 当前构建产物: ~155KB → 60KB (gzipped)

2. **CDN 部署**
   - 将 `frontend-dist/assets/*` 部署到 CDN
   - 修改 HTML 中的资源路径

3. **懒加载路由**
   - 已实现：所有业务页面按需加载

### 后端优化

1. **数据库连接池**
   - 已配置：max_idle_conns: 10, max_open_conns: 100

2. **日志级别**
   - 生产环境：修改为 "warn" 或 "error"

3. **Gin 模式**
   - 生产环境：修改为 "release"

## 监控和日志

### 日志位置

- **应用日志**：`logs/app.log`（如果配置为 file 输出）
- **控制台日志**：标准输出

### 日志级别

- `debug`：开发环境
- `info`：测试环境
- `warn`：生产环境

## 备份和恢复

### 数据库备份

```bash
mysqldump -u root -p charonoms > charonoms_backup.sql
```

### 数据库恢复

```bash
mysql -u root -p charonoms < charonoms_backup.sql
```

## 技术支持

### 文档

- **前端 README**: `frontend/README.md`
- **进度报告**: `frontend/PROGRESS.md`
- **实施总结**: `frontend/IMPLEMENTATION_SUMMARY.md`

### 联系方式

如有问题，请参考项目文档或提交 Issue。

---

**最后更新**: 2026-02-11
**项目版本**: 1.0.0
