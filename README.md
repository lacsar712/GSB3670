# 悦康体检中心管理系统 (HarmonyHealth)

这是一个现代化的体检中心管理系统，集成了 AIGC 技术用于健康报告分析，并实现了完全的容器化部署。

## 🛠 技术栈
- **Frontend**: React + Ant Design + Tailwind CSS + Vite
- **Backend**: Spring Boot 3 + MyBatis-Plus + MySQL
- **AI Integration**: 本地 AIGC 模拟服务 (100% 本地运行，不依赖外部 API)
- **Deployment**: Docker + Docker Compose

---

## ⚠️ 常见问题排查 (Troubleshooting)

### 1. 登录后报“网络错误”
如果在 Docker 容器正常运行的情况下，登录进入系统后报“网络错误”，通常是前端代理配置问题：
- **开发环境**: 如果您使用 `npm run dev` 启动前端，请确保 `frontend/vite.config.js` 中的 `proxy.target` 指向正确的后端地址（如 `http://localhost:8080`）。
- **容器环境**: Nginx 代理会自动处理 `http://backend:8080`。如果报错，请检查浏览器控制台 (F12) 的网络请求路径是否正确。

## How to Run
1. 确保已安装并启动 **Docker Desktop**。
2. 在项目根目录执行：
   ```bash
   docker compose up --build
   ```
3. 等待所有容器启动完成。系统会自动创建数据库并填充演示数据。

## Services
- **前端页面**: [http://localhost:3000](http://localhost:3000)
- **后端接口**: [http://localhost:8080](http://localhost:8080)
- **数据库**: `localhost:3306` (User: `root` / Pass: `root`)

## 🧪 测试账号
- **Admin**: `admin` / `123456`
- **User**: `user1` / `123456`

## Verification (自测说明)
1. **登录系统**: 打开 `http://localhost:3000`，使用管理员账号 `admin` / `123456` 登录。
2. **体检预约**: 切换到普通用户账号 `user1`，在左侧菜单点击“套餐管理”，选择任一套餐点击“立即预约”。
3. **录入数据**: 登录管理员账号，在“体检报告”页面点击右上角“录入体检数据”，弹窗中填写真实体检指标并保存。
4. **生成AI报告**: 在体检报告列表中找到对应报告，点击“AI 分析”按钮。
   - **注意**: 此功能**不依赖任何外部 API 调用**，所有逻辑均在后端服务本地模拟生成，符合交付安全规范。
5. **验证结果**: 生成完成后点击“查看详情”，验证本地生成的分析总结意见是否显示。

---

## ✨ 核心特性
- **一键启动**: 完全容器化，零环境依赖。
- **AIGC 本地分析**: 自动根据体检指标生成专业、易懂的中文健康建议（本地逻辑实现）。
- **现代美学**: 采用 Ant Design 现代组件库，结合 Tailwind 实现流畅视觉体验。
- **规范交互**: 所有删除操作均通过 UI 设计（弹窗确认），避免误删。
- **移动端适配**: 支持不同屏幕尺寸，响应式布局。

