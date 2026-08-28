# 意游记 · Italy Travel Guide

Personal Italy travel guide and trip planning web app.

## 当前版本

**Web V0.1 — 首页原型**

这一阶段先把首页的视觉方向、内容模块和基本交互跑起来。功能仍处于探索期，后续会继续调整，不把当前模块视为最终定案。

### 当前首页包含

- 中文默认界面
- 手账 / 纸张 / 水彩风格
- 首页手绘意大利地图
- 14 天行程预览入口
- 六大区域横向矩形卡片
- 基于攻略数据库的区域名称与部分推荐数据
- “可能适合你的地点”推荐模块（当前为本地模拟，未来可接天气 / 位置 / 收藏逻辑）
- 我的攻略本：想去的地方 / 携带清单 / 紧急联系电话 / 我已经去过
- 情绪价值卡片：今日旅行鼓励
- 实用攻略速览
- 桌面 / 手机响应式布局

## 产品结构方向

当前数据与页面层级按：

`Area → Destination → Place`

首页先聚焦 Area 与攻略入口。Area / Destination / Place 子页面会在首页方向稳定后继续设计。

## 原型期原则

- 功能模块可随时替换、移动或删除。
- 数据与展示尽量分离，当前示例数据放在 `data.js`。
- 不依赖 Google Fonts / Google Maps / 海外 CDN。
- 图片、CSS、JS 走仓库内本地资源，方便未来迁移到中国大陆服务器。
- 第一版图片主要作为视觉占位，后续再逐步替换为自有或明确授权素材。

## GitHub Pages

仓库根目录包含 `index.html`，可以直接使用 GitHub Pages 预览。

在 GitHub 中打开：

`Settings → Pages → Build and deployment → Deploy from a branch → main / (root) → Save`

启用后测试地址通常为：

`https://susanlondon.github.io/italy-travel-guide/`

## 本地预览

直接打开 `index.html` 即可，也可以使用任意静态服务器运行。
