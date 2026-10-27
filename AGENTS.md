<!-- GLOBAL-RULES:BEGIN -->
## 全局配置（跨项目通用，必读）

> 本段是"全局配置"的唯一源文件副本，由 `C:\Users\19182\.agents\sync-agent-rules.ps1` 同步到各 agent 的规则文件。
> 修改请改源文件 `C:\Users\19182\.agents\AGENTS.global.md`，再运行同步脚本，不要直接手工改副本。

### 1. 动手前先查证
接任何任务，先检查项目现状：目录结构、README/AGENTS.md、docs、已有代码、`git log`、是否已有相关配置或产物。
**没搞清楚"现在是什么状态"之前，不新建文件、不改动已有文件。**

### 2. 不编造
不确定的部分直接说不确定，说明缺什么信息才能确认。
禁止：编造接口字段、文件路径、命令行参数、数据数值、不存在的功能、没做过的验证结论。

### 3. 不盲目附和
用户说的内容有问题时，直接指出并说明依据（事实、文档、代码、报错）。
不要为了"让用户满意"而附和错误判断；也不要用"好的，没问题"掩盖没做的验证。

### 4. 调研要交叉验证
重要结论至少两个来源交叉验证，并标明来源与时间（链接、文件路径、命令输出）。
单一来源的说法要注明"仅单一来源，未核实"。

### 5. 风险操作先给方案
涉及**删除、覆盖、发布上线、推送到远端仓库、改动生产配置、批量改写文件**等操作：
先说明"要做什么、影响什么、怎么回滚"，等用户确认后再执行。
只读操作（查看、检查、搜索）不需要确认。

### 6. 技能库位置（跨工具共用）
本机已安装的 Agent Skills，做对应任务前先读匹配 skill 的 `SKILL.md` 再动手，不要凭猜测：
- `C:\Users\19182\.claude\skills\` —— 188 个，覆盖学术检索、训练/推理/部署、论文写作、绘图、实验管理等；每个子目录一个 skill，入口文件为 `SKILL.md`。
- `C:\Users\19182\.agents\skills\` —— 7 个 UI/设计类 skill。
`SKILL.md` 里的 `allowed-tools` 用的是 Claude Code 工具名（Bash/Read/Write 等），其他工具按自身等价能力替换；skill 与任务不匹配时不要硬套。

### 冲突处理
本文件与后续对话内容冲突时，以本文件为准；本文件与项目内 `AGENTS.md` 冲突时，项目内更具体的规则优先。
<!-- GLOBAL-RULES:END -->

# 项目配置 · v1 米白图纸大屏（单页面）

- 定位：单页工程图纸风格大屏，1920×1080 单屏无滚动；四主题 ?theme=paper|blue|graphite|sepia，**默认 paper**。
- 技术栈：Vue 3 + TypeScript + Vite；无 UI 库、无图表库；拓扑与波形均为手写 SVG。
- 结构：rontend/src/components/{SheetStage,TitleBlock,ConsoleRack,NodeDossier,RecordStrip}.vue；数据 src/data/model.ts；样式 src/styles/app.css。
- 构建校验：cd frontend && npm run build 必须通过（纯 vite build，不用 tsc）。
- 数据：全部示意数据；真实拓扑与参数不得入库。