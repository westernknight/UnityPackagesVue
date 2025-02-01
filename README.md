# UnityVue

一个基于Vue.js和Node.js的Unity资源管理系统，用于管理和分享Unity资源包。

## 功能特点

- 文件上传：支持.unitypackage文件的上传和预览
- MD5校验：防止重复上传相同的资源文件
- 标签管理：支持为资源添加多个标签，方便分类和检索
- 预览功能：支持为每个资源包添加预览图
- 资源管理：支持编辑和删除已上传的资源
- 响应式设计：适配不同设备的显示需求

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
└── server.cjs         # 后端服务器
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

## 贡献

欢迎提交Pull Request。请确保遵循现有的代码风格。

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)
