# AGENTS.md

面向 AI 编码代理与开发者的项目约定。

## 项目结构

- `frontend/` — Vue 3 + TS + Vite 大屏前端，所有代码在这里。
- `docs/` — 会议纪要与设计规格文档，**是 UI 实现的唯一事实源**：
  - `docs/2026_10月会议纪要/前端界面详细规格说明.md`：逐元素规格（布局坐标、色板 token、控件默认值、示例数据）。
  - `docs/2026_10月会议纪要/前端界面风格描述与任务划分.md`：风格总结与 T0–T4 任务包分工。
- 参考效果图在 `docs/2026_10月会议纪要/图片和附件/`。

## 设计系统（改动前必读）

所有颜色必须引用 `frontend/src/style.css` 中的 CSS 变量，禁止硬编码色值：
主色 `--accent-cyan #00d8ff`；语义色 `--success`（正常/完成）、`--warning`（越限/排队中）、`--danger`（故障，预留）、`--accent-blue`（运行中）；曲线色 `--chart-purple`（无功）、`--chart-green`（频率）、`--chart-orange`（有功）。

面板统一使用 `GPanel.vue` 外壳（半透明深蓝底 + 1px 青色发光描边 + 四角 L 形折角 + 图标标题行），不要在业务组件里另写面板样式。

字号层级：页面主标题 30px 粗体带辉光、面板标题 18px、正文/控件 14px、表格 13px、辅助 12px；数字/时间用 `--font-mono`。

动效只保留：拓扑连线能量流动（`flow-dash`）、告警呼吸（`pulse-glow`）、进度条/状态过渡 150–600ms。新增动效需同时提供 `prefers-reduced-motion` 降级（style.css 末尾已有全局降级）。

## 布局约束

- 设计基准 1920×1080 单屏，无页面滚动；大屏缩放由 `App.vue` 的 `fitScreen`（transform: scale）处理，不要在业务面板里再写缩放。
- 主区三列：左 385px 配置面板 / 中 1fr 拓扑 / 右 500px（波形 + 节点状态）；底部 250px 双面板（场景库 1.4fr / 任务表 1fr）。
- 修改布局时保持无溢出、无零尺寸元素（Playwright DOM 校验脚本曾以此验收）。

## 数据与状态

- 当前全部数据在 `frontend/src/mock/data.ts`（内容来自规格文档的示例数据），类型定义在 `src/types/index.ts`。
- 全局状态在 `src/stores/dashboard.ts`（Pinia）：拓扑/量测/任务/场景/波形 + 联动 action。
- 联调真实接口时：只改 mock 层与 store 的取数 action，组件 props/模板尽量不动；接口动作与 store action 一一对应（提交任务=submitTask、切拓扑=setTopology、场景回填=applyScenario）。

## 提交与验证

- 提交前必须通过：`cd frontend && npm run build`（tsc + vite build）。
- UI 改动建议用 Playwright 截图 + DOM 校验（面板数量=6、无水平溢出、无零尺寸元素、无页面报错），多分辨率抽查 1366×768 / 1920×1080 / 2560×1440。
- dev server：`npm run dev`（端口 5173）；后台运行日志在 `frontend/dev-server.log`。

## 约定

- 组件命名：面板组件 `XxxPanel.vue`，通用前缀 `G`。
- mock 数据中的示例数值（节点量测、任务表、场景卡）与规格文档保持一致，不要随手改。
- 提交信息用中文短句，说明改了哪个面板/解决了什么问题。