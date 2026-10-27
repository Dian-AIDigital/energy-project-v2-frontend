<script setup lang="ts">
import { computed, ref } from 'vue'
import { buildTraces, tasks } from '../data/model'

const traces = buildTraces(260)
const cursor = ref(0.62)

const W = 720
const laneH = 38
const lanes = computed(() => {
  const t = traces
  const mk = (vals: number[], min: number, max: number, key: string, cls: string) =>
    vals
      .map((v, i) => `${((i / (vals.length - 1)) * W).toFixed(1)},${((1 - (v - min) / (max - min)) * (laneH - 8) + 4).toFixed(1)}`)
      .join(' L ')
  return [
    { key: 'U', cls: 'l1', path: mk(t.v, 524.4, 525.8, 'U', 'l1'), unit: 'kV', last: t.v[t.v.length - 1].toFixed(1), min: '523.2', max: '526.8' },
    { key: 'f', cls: 'l2', path: mk(t.f, 49.965, 50.045, 'f', 'l2'), unit: 'Hz', last: t.f[t.f.length - 1].toFixed(2), min: '49.90', max: '50.12' },
    { key: 'P', cls: 'l3', path: mk(t.p, 171, 201, 'P', 'l3'), unit: 'MW', last: t.p[t.p.length - 1].toFixed(1), min: '168', max: '204' },
    { key: 'Q', cls: 'l4', path: mk(t.q, 29, 43, 'Q', 'l4'), unit: 'Mvar', last: t.q[t.q.length - 1].toFixed(1), min: '26', max: '46' },
  ]
})

const stateText: Record<string, string> = { done: '完成', running: '运行中', queued: '排队中' }
</script>

<template>
  <section class="strip">
    <!-- 左：记录带（波形） -->
    <div class="trace">
      <header class="t-head">
        <span class="eyebrow">记录带 / TRACE · 水电 D 厂端电压</span>
        <span class="t-meta">
          <b class="num">0.00 – 3.00</b><span class="unit">s</span>
          <span class="sep" />
          <span class="unit">采样 12.5 ms</span>
          <span class="sep" />
          <span class="unit">窗口 3 s</span>
        </span>
      </header>

      <div class="plot">
        <div
          v-for="(l, i) in lanes"
          :key="l.key"
          class="lane"
        >
          <div class="lane-label">
            <b>{{ l.key }}</b>
            <span class="unit">{{ l.unit }}</span>
            <em class="rng">{{ l.min }}–{{ l.max }}</em>
          </div>
          <svg class="lane-svg" :viewBox="`0 0 ${W} ${laneH}`" preserveAspectRatio="none">
            <line x1="0" :y1="laneH / 2" :x2="W" :y2="laneH / 2" class="lane-mid" />
            <g class="lane-ticks">
              <line x1="0" y1="4" x2="5" y2="4" /><line x1="0" :y1="laneH / 2" x2="5" :y2="laneH / 2" />
              <line x1="0" :y1="laneH - 4" x2="5" :y2="laneH - 4" />
            </g>
            <path :d="`M ${l.path}`" :class="['lane-line', l.cls]" />
            <circle :cx="W * cursor" :cy="laneH / 2" r="2" class="lane-dot" />
          </svg>
          <div class="lane-val num">{{ l.last }}</div>
        </div>

        <!-- 时间光标 -->
        <div class="cursor" :style="{ left: `calc(56px + ${cursor} * (100% - 112px))` }">
          <span class="cursor-badge num">t = {{ (cursor * 3).toFixed(2) }} s</span>
        </div>

        <div class="axis">
          <span v-for="i in 7" :key="i" class="tick num">{{ ((i - 1) * 0.5).toFixed(1) }}</span>
        </div>
      </div>
    </div>

    <!-- 右：运行记录 -->
    <div class="log">
      <header class="t-head">
        <span class="eyebrow">运行记录 / RUN LOG</span>
        <span class="t-meta"><span class="dot" />2 个任务运行中</span>
      </header>

      <div class="rows">
        <div v-for="t in tasks.slice(0, 3)" :key="t.id" class="row" :class="t.state">
          <span class="time num">{{ t.time }}</span>
          <span class="rid num">{{ t.id.slice(-3) }}</span>
          <span class="kind">{{ t.kind }}<em>{{ t.engine }}</em></span>
          <span class="bar"><i :style="{ width: t.progress + '%' }" /></span>
          <span class="pct num">{{ t.progress }}%</span>
          <span class="st">{{ stateText[t.state] }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.strip {
  display: grid;
  grid-template-columns: 1fr 0.82fr;
  gap: var(--s5);
  min-height: 0;
  padding: 14px 16px;
  border: 1px solid var(--rule);
  border-radius: var(--r-lg);
  background: var(--strip-bg);
}

.t-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--s2);
}
.t-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--t2);
}
.t-meta b { font-size: 12.5px; color: var(--t2); }
.sep { width: 1px; height: 8px; background: var(--rule); }

/* 记录带 */
.plot {
  position: relative;
  padding-bottom: 16px;
  background-image:
    repeating-linear-gradient(0deg, transparent 0 37px, var(--rule-soft) 37px 38px),
    repeating-linear-gradient(90deg, transparent 0 calc(16.666% - 1px), var(--rule-soft) calc(16.666% - 1px) 16.666%);
}
.lane {
  display: grid;
  grid-template-columns: 56px 1fr 52px;
  align-items: center;
  gap: var(--s2);
  height: 38px;
}
.lane-label {
  display: flex;
  align-items: baseline;
  gap: 4px;
  justify-content: flex-end;
}
.lane-label .rng { font-family: var(--font-mono); font-style: normal; font-size: 9.5px; color: var(--t4); margin-left: 2px; }
.lane-label b {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--t2);
  font-weight: 500;
}
.lane-svg { width: 100%; height: 38px; display: block; overflow: visible; }
.lane-mid { stroke: var(--rule-soft); stroke-width: 1; }
.lane-ticks line { stroke: var(--rule-strong); stroke-width: 1; }
.lane-line { fill: none; stroke-width: 1.2; vector-effect: non-scaling-stroke; }
.l1 { stroke: var(--sig); }
.l2 { stroke: var(--sig-ice); stroke-dasharray: 5 3; }
.l3 { stroke: var(--sig); opacity: 0.55; }
.l4 { stroke: var(--t2); stroke-dasharray: 2 3; opacity: 0.8; }
.lane-dot { fill: var(--t1); }
.lane-val { font-size: 12.5px; color: var(--t2); text-align: right; line-height: 1.15; }
.lane-val em { display: block; font-style: normal; font-size: 8px; color: var(--t4); letter-spacing: 0.3px; }

.cursor {
  position: absolute;
  top: 0;
  bottom: 16px;
  width: 1px;
  background: rgba(232, 241, 250, 0.35);
  pointer-events: none;
}
.cursor-badge {
  position: absolute;
  border-radius: var(--r-sm);
  top: -4px;
  left: 4px;
  padding: 1px 5px;
  font-size: 9px;
  color: var(--t1);
  background: var(--float-bg);
  border: 1px solid var(--rule-strong);
  white-space: nowrap;
}

.axis {
  position: absolute;
  left: 56px;
  right: 52px;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  color: var(--t3);
}

/* 运行记录 */
.rows { display: grid; gap: 1px; }
.row {
  display: grid;
  grid-template-columns: 46px 28px 112px 1fr 32px 40px;
  align-items: center;
  gap: var(--s2);
  padding: 5px 2px;
  font-size: 11.5px;
  color: var(--t2);
  border-bottom: 1px dotted var(--rule-soft);
}
.row .time { color: var(--t3); font-size: 10.5px; }
.row .rid { color: var(--t2); font-size: 11.5px; }
.kind { color: var(--t2); font-size: 12.5px; }
.kind em {
  font-style: normal;
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--t3);
  margin-left: 6px;
}
.bar { height: 2px; background: var(--rule); position: relative; }
.bar i { position: absolute; inset: 0 auto 0 0; background: var(--sig); }
.row.done .bar i { background: var(--sig-ice); }
.row.queued .bar i { background: var(--alarm); opacity: 0.7; }
.pct { text-align: right; color: var(--t2); }
.st {
  font-family: var(--font-mono);
  font-size: 10.5px;
  text-align: right;
  color: var(--t3);
}
.row.running .st { color: var(--sig-ice); }
.row.done .st { color: var(--sig-ice); }
.row.queued .st { color: var(--alarm); }
.row.queued .pct { color: var(--alarm); }

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--sig-ice);
  display: inline-block;
  margin-right: 4px;
}
</style>
