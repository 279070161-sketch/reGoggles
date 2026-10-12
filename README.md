# reGoggles - Open Wearable AI Platform

> An Open Wearable AI Platform for Industrial Assistance, Egocentric Data Collection, and Intelligent Maker Innovation.

---

## 📁 目录结构说明 (Project Structure)

```text
reGoggles/
├── .github/                 # GitHub Actions 自动化部署流水线
├── assets/                  # 官方网站前端所需静态媒体素材
│   ├── images/              # 高清渲染图与界面视觉素材
│   │   ├── applications/    # 行业应用场景示意图
│   │   ├── iterations/      # ID 迭代渲染图 (V1.0 - V4.0)
│   │   └── sensors/         # 传感器模组特写图 (RGB, IMU, Audio, Depth...)
│   └── videos/              # 硬件模组演示与防护测试视频
├── cad/                     # 工业级 3D CAD 原始模型文件 (.stp)
├── public/                  # Vite 公共静态资源目录
│   ├── logo.svg             # 矢量 Logo / 图标
│   └── reGoggles-3D-1008.glb # 经过优化的 3D 网页交互模型 (带透明镜片材质)
├── resources/               # 归档与原始设计参考素材
│   ├── id_iterations/       # ID 迭代原始图包
│   ├── ref_images/          # 设计参考切片图库
│   ├── renders_260910/      # 2026-09-10 渲染图片原件
│   ├── renders_260923/      # 2026-09-23 模组特写渲染原件
│   └── tapnow_raw/          # 原始截图备份
├── scripts/                 # 工程辅助与模型格式转换脚本
│   ├── convert-step.js      # STEP 转 GLTF 导出脚本
│   └── convert-step-glb.js  # STEP 独立解析构建二进制 GLB 脚本
├── src/                     # 网页核心源码
│   ├── hero3d.js            # Three.js 3D 实时交互视口控制器
│   ├── main.js              # 页面滚动、视频联动交互逻辑
│   └── style.css            # 工业科技美学样式表
├── index.html               # 网站主入口页面
├── vite.config.js           # Vite 打包配置
├── package.json             # 依赖与脚本配置
└── README.md                # 项目文档
```

---

## 🛠️ 快速启动 (Quick Start)

### 1. 安装依赖
```bash
npm install
```

### 2. 启动本地开发服务器
```bash
npm run dev
```
本地访问：[http://localhost:3000](http://localhost:3000)

### 3. 构建生产版本
```bash
npm run build
```
打包输出目录为 `dist/`。

### 4. 重新转换 CAD 3D 模型 (可选)
如果更新了 `cad/reGoggles 3D-1008.stp`，可运行：
```bash
npm run convert:glb
```
自动将 CAD 转换为 `public/reGoggles-3D-1008.glb`，并配置镜片高透物理材质。
