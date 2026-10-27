# 新能源荷储技术实证平台 · 工作台（v2）

Vue 3 + Vite + Node(Express mock) 的前端。**v2 重构**：放弃 v1 的「大屏七分区」架构，改为参考 B 端控制台/计费后台的信息架构——左侧导航 + 顶部工具条 + 内容区卡片与表格。

> v1（图纸式大屏，含四主题）已完整存档在 git 提交 `c6846e4`，需要对照或回退时 `git show c6846e4`。

## 运行

```powershell
cd D:\energy\webapp
node node_modules\vite\bin\vite.js --port 5180      # 页面 http://127.0.0.1:5180/
node server\mock-api.mjs                            # 可选：Node mock API :5182
```

URL 参数：`?tab=overview|topology|config|scenarios|tasks`，例如 <http://127.0.0.1:5180/?tab=topology>。

## 信息架构

```
左侧导航 232px                主区
├─ NESP 标识                 ├─ 顶部工具条：页面标题 / 日期 chip / 同步状态
├─ 工作区切换（Production）    │             搜索框 · 导出 · 新建仿真（主按钮）
├─ 工作区：运行概览/拓扑/参数   └─ 内容区（可滚动）
├─ 数据：场景库/仿真任务            概览：3 张概览卡 + 波形卡 + 指标列 + 任务表
├─ 系统：引擎与设置                  拓扑：单线图 + 选中节点检查器
└─ 底部：下一次仿真 / 引擎在线率      参数：表单卡 + 提交说明侧栏
     / 当前用户                      场景库 / 任务：筛选项 + 数据表
```

## 关键设计决定（对照参考图）

| 项 | 决定 |
| --- | --- |
| 底色 | `#F4F3EF` 暖灰，卡片纯白、1px 描边、12px 圆角，只用一层阴影 |
| 强调 | 主色是**黑**（主按钮、选中标签页、进度条），不用彩色主色 |
| 语义色 | 红 `#C0392B` 只给告警，琥珀 `#A9762A` 只给排队，绿只给已完成；其余一律灰阶 |
| 字体 | 中文 HarmonyOS Sans SC；数字同族 + `tabular-nums`；小标签用 10.5px 大写灰字 |
| 图表 | 细线 1.6px、无面积填充、事件点空心、预估段虚线、游标虚线 + 白色浮标 |
| 表格 | 行高 44px、表头大写小字、进度条细条 + 百分比、状态点 + 文字 |
| 拓扑 | 白底单线图，母线深灰 3px、支路浅蓝灰 1.3px、故障元件红描边 |

## 截图

| 文件 | 视图 |
| --- | --- |
| `shots/app-overview.png` | 运行概览（1920×1080） |
| `shots/app-topology.png` | 拓扑视图 + 节点检查器 |
| `shots/app-config.png` | 参数配置表单 |
| `shots/app-scenarios.png` | 场景库表格 |
| `shots/app-tasks.png` | 仿真任务表格 |

截图均来自 Edge 无头渲染真实 dev server，非设计稿。

## 目录

```
webapp/
├─ src/
│  ├─ App.vue              外壳：侧栏 + 顶栏 + tab 内容
│  ├─ components/
│  │  ├─ SideNav.vue       品牌、工作区切换、分组导航、引擎状态、用户
│  │  └─ TopBar.vue        标题、同步状态、搜索、导出、新建仿真
│  ├─ views/
│  │  ├─ OverviewView.vue  概览卡 + 波形 + 指标列 + 任务表
│  │  ├─ TopologyView.vue  单线图 + 检查器
│  │  ├─ ConfigView.vue    参数表单 + 提交说明
│  │  ├─ ScenariosView.vue 场景库表
│  │  └─ TasksView.vue     任务表 + 筛选
│  ├─ data/model.ts        9 母线 / 9 支路 / 6 场景 / 5 任务 / 波形合成
│  └─ styles/app.css       设计 token 与基础组件（卡片/按钮/标签页/进度条）
├─ server/mock-api.mjs     Express mock API
└─ shots/                  真实截图
```

## 生产构建

```text
vite v6.4.5
dist/assets/index-*.css   21.5 kB │ gzip  4.6 kB
dist/assets/index-*.js    92.4 kB │ gzip 35.8 kB
```

## 未做 / 待确认

- 未接真实后端：数据来自 `src/data/model.ts`，接口契约见 `平台开发/接口契约_v0.1.md`；
- 图表与拓扑尚未做缩放、游标联动与键盘可达性验证；
- 「新建仿真」主按钮目前只切换视图，未接提交动作；
- 场景库/任务的筛选是前端过滤，未分页请求。
