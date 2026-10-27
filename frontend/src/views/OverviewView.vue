<script setup lang="ts">
import { computed } from 'vue'
import { buildTraces, tasks, buses } from '../data/model'

const emit = defineEmits<{ (e: 'go', tab: string): void }>()

const tr = buildTraces(120)
const W = 720
const H = 150

const series = computed(() => {
  const v = tr.v
  const min = Math.min(...v)
  const max = Math.max(...v)
  const pts = v.map((val, i) => {
    const x = (i / (v.length - 1)) * W
    const y = H - ((val - min) / (max - min)) * (H - 22) - 11
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const split = Math.round(v.length * 0.72)
  return {
    solid: pts.slice(0, split).join(' L '),
    dashed: pts.slice(split - 1).join(' L '),
    min: min.toFixed(1),
    max: max.toFixed(1),
  }
})

const totals = computed(() => {
  const gen = buses.filter((b) => b.read.p > 0).reduce((s, b) => s + b.read.p, 0)
  return gen.toFixed(1)
})
</script>

<template>
  <div class="view">
    <!-- 第一行：三个概览卡 -->
    <section class="row three">
      <article class="card hero">
        <header>
          <span class="label">本次仿真 · 时域</span>
          <span class="pill"><i class="dot ok" />已收敛</span>
        </header>
        <div class="big">
          <b class="num">3.00</b><em>s</em>
          <span class="delta">比上次快 1.2 s</span>
        </div>
        <p class="meta">T20261023002 · 多源互联电网 · 故障恢复 · 8.4 s 墙钟</p>
        <svg class="spark" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none">
          <path :d="`M ${series.solid}`" class="sp-solid" />
          <path :d="`M ${series.dashed}`" class="sp-dash" />
        </svg>
        <footer class="legend">
          <span><i class="lg lg-a" />电压 525 kV 母线</span>
          <span><i class="lg lg-b" />预估值</span>
          <span class="lg-note">0 — 3.00 s · 采样 12.5 ms</span>
        </footer>
      </article>

      <article class="card stat">
        <span class="label">电压范围</span>
        <div class="big"><b class="num">524.9</b><em>—</em><b class="num">525.8</b><em class="u">kV</em></div>
        <p class="meta">越限 0 次 · 最低点出现在 1.86 s</p>
        <div class="bar"><i style="width: 64%" /></div>
        <p class="meta small">允许区间 522.0 — 528.0 kV</p>
      </article>

      <article class="card queue">
        <header>
          <span class="label">队列与引擎</span>
          <span class="link" @click="emit('go', 'tasks')">查看全部 →</span>
        </header>
        <div class="q-row">
          <b class="num">2</b>
          <span>个任务运行中，队列容量 8</span>
        </div>
        <div class="bar"><i style="width: 25%" /></div>
        <ul class="q-list">
          <li><i class="dot run" />T…002 优化调度<span class="num">68%</span></li>
          <li><i class="dot run" />T…003 可靠性评估<span class="num">41%</span></li>
          <li><i class="dot warn" />T…004 故障仿真<span class="num">排队</span></li>
        </ul>
      </article>
    </section>

    <!-- 第二行：波形 + 右侧指标 -->
    <section class="row chartrow">
      <article class="card chart">
        <header class="chart-head">
          <div>
            <h2>波形记录</h2>
            <p class="meta">水电 D 厂 · 端电压 / 频率 / 有功，任务 T20261023002</p>
          </div>
          <div class="tabs">
            <button class="tab on">电压</button>
            <button class="tab">频率</button>
            <button class="tab">有功</button>
            <button class="tab">无功</button>
          </div>
        </header>

        <div class="plot">
          <svg :viewBox="`0 0 ${W + 46} ${H + 34}`" preserveAspectRatio="none">
            <!-- 网格 -->
            <g class="grid">
              <line v-for="i in 4" :key="i" x1="40" :y1="(i - 1) * 37 + 11" :x2="W + 40" :y2="(i - 1) * 37 + 11" />
              <line v-for="i in 7" :key="'v' + i" :x1="40 + ((i - 1) * W) / 6" y1="11" :x2="40 + ((i - 1) * W) / 6" :y2="H + 11" />
            </g>
            <g transform="translate(40,11)">
              <path :d="`M ${series.solid}`" class="line-solid" />
              <path :d="`M ${series.dashed}`" class="line-dash" />
              <!-- 事件点 -->
              <circle cx="232" cy="74" r="3.4" class="ev" />
              <circle cx="418" cy="96" r="3.4" class="ev-red" />
              <circle cx="556" cy="52" r="3.4" class="ev" />
              <!-- 游标 -->
              <line x1="418" y1="0" x2="418" y2="150" class="cursor" />
            </g>
            <!-- 轴标 -->
            <text x="2" y="18" class="ax num">{{ series.max }}</text>
            <text x="2" y="86" class="ax num">525.3</text>
            <text x="2" y="154" class="ax num">{{ series.min }}</text>
            <text v-for="i in 7" :key="'x' + i" :x="40 + ((i - 1) * W) / 6" :y="H + 30" text-anchor="middle" class="ax num">
              {{ ((i - 1) * 0.5).toFixed(1) }}
            </text>
          </svg>

          <div class="tip" style="left: 52%; top: 8px">
            <b class="num">525.1 kV</b>
            <span>t = 1.86 s · 电压跌落</span>
          </div>
        </div>

        <footer class="chart-foot">
          <span class="chip red"><i class="dot err" />1.86 s 电压跌落 0.4 kV</span>
          <span class="chip"><i class="dot run" />2.40 s 恢复至区间内</span>
          <span class="chip-ghost">虚线为剩余时段预估</span>
        </footer>
      </article>

      <article class="card side-stats">
        <div class="stack">
          <span class="label">频率偏差</span>
          <div class="big small"><b class="num">0.012</b><em>Hz</em></div>
          <p class="meta">低于死区阈值 0.02 Hz</p>
        </div>
        <div class="stack">
          <span class="label">恢复时间</span>
          <div class="big small"><b class="num">0.54</b><em>s</em></div>
          <p class="meta">进入 ±200 W 并保持</p>
        </div>
        <div class="stack alert">
          <span class="label red">告警 1 条</span>
          <p class="alert-t"><b>D 换流站</b> 换流阀饱和，无功输出受限</p>
          <button class="btn ghost red" @click="emit('go', 'topology')">在拓扑中查看 →</button>
        </div>
        <div class="stack">
          <span class="label">全网注入</span>
          <div class="big small"><b class="num">{{ totals }}</b><em>MW</em></div>
        </div>
      </article>
    </section>

    <!-- 第三行：任务表 -->
    <section class="card table-card">
      <header class="table-head">
        <h2>仿真任务</h2>
        <div class="tabs">
          <button class="tab on">全部 <em>5</em></button>
          <button class="tab">运行中 <em>2</em></button>
          <button class="tab">排队 <em>1</em></button>
        </div>
        <button class="btn ghost" @click="emit('go', 'tasks')">打开任务页 →</button>
      </header>

      <table>
        <thead>
          <tr>
            <th>任务</th>
            <th>拓扑 / 场景</th>
            <th class="w-prog">进度</th>
            <th>耗时</th>
            <th>状态</th>
            <th class="right">创建时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tasks" :key="t.id">
            <td>
              <div class="cell-task">
                <span class="tic">{{ t.kind.slice(0, 1) }}</span>
                <div>
                  <b>{{ t.kind }}</b>
                  <em class="num">{{ t.id }}</em>
                </div>
              </div>
            </td>
            <td class="muted">多源互联电网 · 典型日</td>
            <td>
              <div class="prog">
                <span class="bar" :class="{ hot: t.state === 'queued' }"><i :style="{ width: t.progress + '%' }" /></span>
                <span class="pct num">{{ t.progress }}%</span>
              </div>
            </td>
            <td class="num">{{ t.state === 'done' ? '8.4 s' : '—' }}</td>
            <td>
              <span class="st" :class="t.state">
                <i class="dot" :class="{ ok: t.state === 'done', run: t.state === 'running', warn: t.state === 'queued' }" />
                {{ t.state === 'done' ? '已完成' : t.state === 'running' ? '运行中' : '排队中' }}
              </span>
            </td>
            <td class="right num muted">{{ t.time }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.view { display: grid; gap: 14px; padding: 18px 24px 24px; }

/* 第一行 */
.row { display: grid; gap: 14px; }
.row.three { grid-template-columns: 1.45fr 1fr 1fr; }
.card { padding: 16px 18px; }

.hero header, .queue header, .chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: var(--r-pill);
  background: var(--green-soft);
  color: var(--green);
  font-size: 11px;
}
.big {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 2px 0 4px;
}
.big b {
  font-size: 38px;
  font-weight: 400;
  letter-spacing: -0.5px;
  line-height: 1.05;
}
.big b + em, .big em {
  font-style: normal;
  font-size: 13px;
  color: var(--t3);
}
.big em.u { font-size: 12px; }
.big.small b { font-size: 26px; }
.delta {
  margin-left: 10px;
  font-size: 11.5px;
  color: var(--green);
}
.meta {
  margin: 0;
  font-size: 11.5px;
  color: var(--t3);
}
.meta.small { font-size: 11px; color: var(--t4); margin-top: 6px; }

.spark {
  width: 100%;
  height: 74px;
  margin: 10px 0 8px;
  overflow: visible;
}
.sp-solid { fill: none; stroke: var(--ink); stroke-width: 1.6; }
.sp-dash { fill: none; stroke: var(--t3); stroke-width: 1.4; stroke-dasharray: 4 4; }
.legend {
  display: flex;
  gap: 14px;
  align-items: center;
  font-size: 11px;
  color: var(--t3);
  border-top: 1px solid var(--bd);
  padding-top: 8px;
}
.legend span { display: inline-flex; align-items: center; gap: 6px; }
.lg { width: 12px; height: 2px; background: var(--ink); display: inline-block; }
.lg-b { background: repeating-linear-gradient(90deg, var(--t3) 0 3px, transparent 3px 6px); }
.lg-note { margin-left: auto; color: var(--t4); }

/* 指标卡 */
.stat .bar { margin: 12px 0 0; }
.queue .q-row { display: flex; align-items: baseline; gap: 8px; margin: 2px 0 10px; }
.queue .q-row b { font-size: 30px; font-weight: 400; }
.queue .q-row span { font-size: 11.5px; color: var(--t3); }
.q-list { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 7px; }
.q-list li {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--t2);
}
.q-list li span { margin-left: auto; color: var(--t3); }
.link { font-size: 11.5px; color: var(--t3); cursor: pointer; }
.link:hover { color: var(--t1); }

/* 波形 */
.chartrow { grid-template-columns: minmax(0, 1fr) 300px; align-items: stretch; }
.chart { display: flex; flex-direction: column; }
.chart h2, .table-card h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.plot { position: relative; margin: 6px 0 4px; flex: 1; min-height: 190px; }
.plot svg { width: 100%; height: 100%; min-height: 190px; display: block; overflow: visible; }
.grid line { stroke: #ecebe4; stroke-width: 1; }
.line-solid { fill: none; stroke: var(--ink); stroke-width: 1.7; }
.line-dash { fill: none; stroke: var(--t3); stroke-width: 1.4; stroke-dasharray: 5 4; }
.ev { fill: #fff; stroke: var(--ink); stroke-width: 1.6; }
.ev-red { fill: var(--red); stroke: #fff; stroke-width: 1.2; }
.cursor { stroke: var(--bd-strong); stroke-width: 1; stroke-dasharray: 3 3; }
.ax { font-size: 9.5px; fill: var(--t4); }
.tip {
  position: absolute;
  transform: translateX(-50%);
  background: #fff;
  border: 1px solid var(--bd-strong);
  border-radius: var(--r-sm);
  padding: 6px 9px;
  box-shadow: 0 6px 18px rgba(30, 26, 15, 0.08);
  display: grid;
  gap: 2px;
  white-space: nowrap;
}
.tip b { font-size: 13px; font-weight: 600; }
.tip span { font-size: 10.5px; color: var(--t3); }

.chart-foot { display: flex; align-items: center; gap: 10px; padding-top: 10px; border-top: 1px solid var(--bd); flex: none; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: var(--r-pill);
  background: var(--card-soft);
  border: 1px solid var(--bd);
  font-size: 11.5px;
  color: var(--t2);
}
.chip.red { background: var(--red-soft); border-color: #efd5d1; color: var(--red); }
.chip-ghost { margin-left: auto; font-size: 11px; color: var(--t4); }

/* 右侧指标 */
.side-stats { display: grid; gap: 14px; align-content: start; }
.stack { display: grid; gap: 3px; padding-bottom: 12px; border-bottom: 1px solid var(--bd); }
.stack:last-child { border-bottom: 0; padding-bottom: 0; }
.stack .label.red { color: var(--red); }
.alert-t { margin: 2px 0 6px; font-size: 12px; color: var(--t2); line-height: 1.5; }
.alert-t b { color: var(--t1); }
.btn.red { color: var(--red); }
.alert { background: var(--red-soft); border-radius: var(--r-sm); padding: 10px; border-bottom: 0; }

/* 表格 */
.table-card { padding: 16px 18px 6px; }
.table-head { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
.table-head .tabs { margin-right: auto; }
.tab em { font-style: normal; color: var(--t4); margin-left: 4px; font-size: 11px; }
table { width: 100%; border-collapse: collapse; }
th {
  text-align: left;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--t3);
  font-weight: 500;
  padding: 8px 10px;
  border-bottom: 1px solid var(--bd);
}
td { padding: 11px 10px; border-bottom: 1px solid #f0eee7; vertical-align: middle; }
tr:last-child td { border-bottom: 0; }
th.right, td.right { text-align: right; }
.muted { color: var(--t3); font-size: 12px; }
.cell-task { display: flex; align-items: center; gap: 10px; }
.tic {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  background: var(--card-soft);
  border: 1px solid var(--bd);
  font-size: 11px;
  color: var(--t2);
}
.cell-task b { display: block; font-size: 12.5px; font-weight: 600; }
.cell-task em { font-style: normal; font-size: 10.5px; color: var(--t4); }
.prog { display: flex; align-items: center; gap: 9px; }
.prog .bar { width: 120px; }
.pct { font-size: 11.5px; color: var(--t2); }
.st { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; }
.st.done { color: var(--t2); }
.st.running { color: var(--blue); }
.st.queued { color: var(--amber); }
</style>
