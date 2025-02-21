# UnityVue

一个基于Vue.js和Node.js的Unity资源管理系统，用于管理和分享Unity资源包。

## 预览

![主页面预览](./readme/202521-235826.jpg)
*主页面 - 资源列表和标签筛选*

![资源管理页面](./readme/202521-235835.jpg)
*管理页面 - 资源上传和编辑*

## 功能特点

- 文件上传：支持.unitypackage文件的上传和预览
- MD5校验：防止重复上传相同的资源文件
- 标签管理：支持为资源添加多个标签，方便分类和检索
- 预览功能：支持为每个资源包添加预览图
- 资源管理：支持编辑和删除已上传的资源
- 响应式设计：适配不同设备的显示需求
- 搜索功能：支持按名称、标签和描述进行快速搜索
- 批量操作：支持批量删除和批量标签管理*
- 版本管理：支持资源包的版本控制和历史记录*
- 资源评分：支持用户对资源进行评分和评论
- 下载统计：记录和展示资源的下载次数和热度*

## 技术栈

- 前端：Vue 3 + Vite + Vue Router + Element Plus
- 后端：Node.js + Express
- 构建工具：Vite
- 文件处理：Multer

## 项目结构

```
/my-vue-app/
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── assets/         # 项目资源
│   ├── components/     # 可复用组件
│   ├── router/        # 路由配置
│   ├── views/         # 页面视图
│   ├── App.vue        # 主应用组件
│   ├── main.js        # 应用入口
│   └── style.css      # 全局样式
├── uploads/            # 上传文件存储目录
├── index.html         # HTML模板
├── package.json       # 项目依赖
├── vite.config.js     # Vite配置
├── server.cjs         # 后端服务器
└── .env               # 环境变量配置文件
```

## 安装

1. 克隆仓库：
```bash
git clone [仓库地址]
cd my-vue-app
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
   - 在项目根目录创建`.env`文件
   - 添加以下配置：
```bash
VITE_API_BASE_URL=http://localhost:3000  # API服务器地址
```

## 开发

1. 启动开发服务器：
```bash
# 启动前端开发服务器
npm run dev

# 启动后端服务器
node server.cjs
```

应用访问地址：
- 前端：http://localhost:5173
- 后端：http://localhost:3000

## 可用脚本

- `npm run dev`: 启动开发服务器
- `npm run build`: 构建生产版本
- `npm run preview`: 预览生产构建

## 部署

1. 构建项目：
```bash
npm run build
```

2. 启动服务器：
```bash
node server.cjs
```

## 使用说明

1. 上传资源：
   - 支持.unitypackage格式
   - 需要同时上传预览图
   - 必须选择至少一个标签

2. 资源管理：
   - 支持编辑资源信息
   - 支持删除资源
   - 支持查看资源详情

## 注意事项

- 上传文件大小可能受到服务器限制
- 确保uploads目录具有写入权限
- 建议定期备份data.json文件
- 根据实际部署环境修改.env中的VITE_API_BASE_URL配置

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)
