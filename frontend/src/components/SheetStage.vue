<script setup lang="ts">
import { computed, ref } from 'vue'
import { buses, lines, scenarios, type Bus } from '../data/model'
import TitleBlock from './TitleBlock.vue'

const props = defineProps<{ selected: number; scenario: string }>()
const emit = defineEmits<{
  (e: 'select', id: number): void
  (e: 'scenario', id: string): void
}>()

const hover = ref<string | null>(null)
const busById = new Map(buses.map((b) => [b.id, b]))
const selBus = computed<Bus>(() => busById.get(props.selected) ?? buses[0])
const hoveredLine = computed(() => lines.find((l) => l.id === hover.value) ?? null)

/** 标注框锚点：优先放在节点右上方，靠近图纸右缘时向左回收 */
const anno = computed(() => {
  const w = 236
  const b = selBus.value
  // 下排负荷节点：标注放到左侧空白，避免压住 525 kV 主母线与其它厂站
  if (b.y >= 380) {
    return { x: Math.max(24, b.x - 300), y: b.y - 66, w, side: 'left' as const }
  }
  return { x: Math.min(b.x + 96, 1000 - w - 26), y: b.y - 148, w, side: 'right' as const }
})

/** 母线长度按电压等级：工程图纸的惯常表达 */
/** 标签基线：有下方符号（换流阀/负荷/储能）时下移，避免压住符号 */
function labelY(b: Bus) {
  return b.kind === 'plant' || b.kind === 'grid' ? b.y + 36 : b.y + 48
}

function barW(b: Bus) {
  return b.kv >= 500 ? 54 : b.kv >= 200 ? 40 : 28
}

function route(a: Bus, b: Bus) {
  if (Math.abs(a.y - b.y) < 4) return `M ${a.x} ${a.y} H ${b.x}`
  const midY = (a.y + b.y) / 2
  if (Math.abs(a.x - b.x) < 4) return `M ${a.x} ${a.y} V ${b.y}`
  return `M ${a.x} ${a.y} V ${midY} H ${b.x} V ${b.y}`
}

function mid(a: Bus, b: Bus) {
  const horizontal = Math.abs(a.y - b.y) < 4
  return {
    x: horizontal ? (a.x + b.x) / 2 : b.x,
    y: horizontal ? a.y : (a.y + b.y) / 2,
    horizontal,
  }
}

function isNeighbour(id: number) {
  return lines.some(
    (l) => (l.from === props.selected && l.to === id) || (l.to === props.selected && l.from === id),
  )
}

/** 机组在母线上方的布置 */
function unitPos(b: Bus, i: number, n: number) {
  const span = barW(b) * 0.7
  const dx = n === 1 ? 0 : -span + (i * (span * 2)) / (n - 1)
  return { x: b.x + dx, y: b.y - 58 }
}

const colRefs = ['A', 'B', 'C', 'D', 'E', 'F']
const rowRefs = ['1', '2', '3', '4']
</script>

<template>
  <section class="stage">
    <header class="stage-top">
      <div class="sheet-name">
        <span class="eyebrow">单线图 / ONE-LINE</span>
        <h2>多源互联电网拓扑</h2>
        <div class="kvs">
          <span><i class="sw" style="--c: var(--sig)"></i>525 kV</span>
          <span><i class="sw" style="--c: var(--sig-ice)"></i>230 kV</span>
          <span><i class="sw" style="--c: var(--t3)"></i>110 / 35 / 10 kV</span>
          <span class="kvs-sep" />
          <span class="unit">节点点击可切换档案 · 悬停线路读参数</span>
        </div>
      </div>

      <div class="layers">
        <span class="eyebrow">图层</span>
        <button
          v-for="s in scenarios"
          :key="s.id"
          class="layer"
          :class="{ on: scenario === s.id, pending: s.state === 'pending' }"
          @click="emit('scenario', s.id)"
        >
          {{ s.short }}
        </button>
      </div>
    </header>

    <div v-if="selBus.read.state === 'warn'" class="alert-strip">
      <b>告警 A-05</b>
      <span><strong>{{ selBus.name }}</strong> · 换流阀饱和，无功输出受限</span>
      <em>建议：降低该站无功指令或投入备用滤波器</em>
    </div>

    <div class="paper">
      <div class="grid-bg" />
      <span class="reg tl" /><span class="reg tr" /><span class="reg bl" /><span class="reg br" />

      <!-- 图纸边角参考坐标 -->
      <div class="refs-top">
        <span v-for="c in colRefs" :key="'c' + c" class="ref num">{{ c }}</span>
      </div>
      <div class="refs-left">
        <span v-for="r in rowRefs" :key="'r' + r" class="ref num">{{ r }}</span>
      </div>

      <svg class="canvas" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
        <!-- 线路 -->
        <g class="lines">
          <template v-for="l in lines" :key="l.id">
            <path
              :d="route(busById.get(l.from)!, busById.get(l.to)!)"
              class="route"
              :class="{ dc: l.type === 'dc', tr: l.type === 'transformer', hot: hover === l.id }"
              @mouseenter="hover = l.id"
              @mouseleave="hover = null"
            />
            <g
              :transform="`translate(${mid(busById.get(l.from)!, busById.get(l.to)!).x}, ${mid(busById.get(l.from)!, busById.get(l.to)!).y}) rotate(${mid(busById.get(l.from)!, busById.get(l.to)!).horizontal ? (l.flow > 0 ? 0 : 180) : (l.flow > 0 ? 90 : -90)})`"
              class="arrow"
            >
              <path d="M -6 -3.5 L 0 0 L -6 3.5" />
            </g>
          </template>
        </g>

        <!-- 变压器符号（画在支路中点） -->
        <g class="trafo">
          <template v-for="l in lines.filter((x) => x.type === 'transformer')" :key="'t' + l.id">
            <g :transform="`translate(${mid(busById.get(l.from)!, busById.get(l.to)!).x}, ${mid(busById.get(l.from)!, busById.get(l.to)!).y})`">
              <circle r="7" cy="-6" class="trafo-c" />
              <circle r="7" cy="6" class="trafo-c" />
            </g>
          </template>
        </g>

        <!-- 母线 + 厂站符号 -->
        <g class="nodes">
          <template v-for="b in buses" :key="b.id">
            <g
              class="node"
              :class="{ on: selected === b.id, warn: b.read.state === 'warn', dim: selected !== b.id && !isNeighbour(b.id) && selected !== 0 }"
              @click="emit('select', b.id)"
            >
              <!-- 母线 -->
              <line :x1="b.x - barW(b) / 2" :y1="b.y" :x2="b.x + barW(b) / 2" :y2="b.y" class="busbar" :style="{ strokeWidth: b.kv >= 500 ? 3.2 : b.kv >= 200 ? 2.4 : 1.8 }" />
              <circle v-if="b.read.state === 'warn'" :cx="b.x" :cy="b.y" r="20" class="warn-halo" />
              <circle v-if="selected === b.id" :cx="b.x" :cy="b.y" r="13" class="halo" />

              <!-- 电源 / 负荷符号 -->
              <template v-if="b.kind === 'grid'">
                <rect :x="b.x - barW(b) / 2 - 18" :y="b.y - 9" width="16" height="18" class="sym" />
                <path :d="`M ${b.x - barW(b) / 2 - 16} ${b.y - 4} H ${b.x - barW(b) / 2 - 4} M ${b.x - barW(b) / 2 - 10} ${b.y - 7} V ${b.y + 5}`" class="sym-thin" />
              </template>
              <template v-else-if="b.kind === 'converter'">
                <rect :x="b.x - 8" :y="b.y + 12" width="16" height="16" class="sym" />
                <path :d="`M ${b.x - 4} ${b.y + 18} l 8 0 m -4 -3 l 0 6`" class="sym-thin" />
              </template>
              <template v-else-if="b.kind === 'storage'">
                <circle :cx="b.x" :cy="b.y + 20" r="7" class="sym" />
                <path :d="`M ${b.x - 3} ${b.y + 17} v 6 M ${b.x + 1} ${b.y + 17} v 6`" class="sym-thin" />
              </template>
              <template v-else-if="b.kind === 'load'">
                <path :d="`M ${b.x} ${b.y + 14} L ${b.x + 8} ${b.y + 26} L ${b.x - 8} ${b.y + 26} Z`" class="sym" />
              </template>

              <!-- 机组 -->
              <template v-if="b.units?.length">
                <template v-for="(u, i) in b.units" :key="u.name">
                  <line :x1="unitPos(b, i, b.units.length).x" :y1="b.y" :x2="unitPos(b, i, b.units.length).x" :y2="unitPos(b, i, b.units.length).y + 7" class="stem" />
                  <circle :cx="unitPos(b, i, b.units.length).x" :cy="unitPos(b, i, b.units.length).y" r="7" class="sym" />
                  <path :d="`M ${unitPos(b, i, b.units.length).x - 3.5} ${unitPos(b, i, b.units.length).y} q 1.75 -3 3.5 0 t 3.5 0`" class="sym-thin" />
                  <text :x="unitPos(b, i, b.units.length).x + 11" :y="unitPos(b, i, b.units.length).y - 1" class="unit-nm">{{ u.name }}</text>
                  <text :x="unitPos(b, i, b.units.length).x + 11" :y="unitPos(b, i, b.units.length).y + 9" class="unit-mw num">{{ u.mw.toFixed(0) }} MW</text>
                </template>
              </template>

              <!-- 标号 + 名称 -->
              <text :x="b.x" :y="b.y - 9" class="tag">{{ String(b.id).padStart(2, '0') }}</text>
              <text :x="b.x" :y="labelY(b)" class="nm" text-anchor="middle">{{ b.name }}</text>
              <text :x="b.x" :y="labelY(b) + 15" class="kv num" text-anchor="middle">{{ b.kv }} <tspan class="kv-u">kV</tspan></text>
              <circle v-if="b.read.state === 'warn'" :cx="b.x + barW(b) / 2 + 4" :cy="b.y" r="2.6" class="warn-dot" />
            </g>
          </template>
        </g>

        <!-- 引出线与标注 -->
        <g class="leader">
          <template v-if="anno.side === 'left'">
            <circle class="anchor-ring" :cx="selBus.x - barW(selBus) / 2 - 2" :cy="selBus.y" r="4.5" />
            <circle class="anchor" :cx="selBus.x - barW(selBus) / 2 - 2" :cy="selBus.y" r="1.8" />
          </template>
          <template v-else>
            <circle class="anchor-ring" :cx="selBus.x" :cy="selBus.y - barW(selBus) / 2 - 2" r="4.5" />
            <circle class="anchor" :cx="selBus.x" :cy="selBus.y - barW(selBus) / 2 - 2" r="1.8" />
          </template>
          <path :d="anno.side === 'left'
            ? `M ${selBus.x - barW(selBus) / 2 - 2} ${selBus.y} H ${anno.x + anno.w + 18} L ${anno.x + anno.w} ${anno.y + 46}`
            : `M ${selBus.x} ${selBus.y - barW(selBus) / 2 - 2} V ${anno.y + 100} H ${anno.x + (anno.x + anno.w <= selBus.x ? anno.w : 0)}`" />
          <g :transform="`translate(${anno.x}, ${anno.y})`">
            <rect width="236" height="100" class="anno-box" />
            <text x="10" y="17" class="anno-h">{{ selBus.name }}</text>
            <text x="226" y="17" class="anno-h num" text-anchor="end">{{ selBus.kv }} kV</text>
            <line x1="10" y1="27" x2="226" y2="27" class="anno-rule" />
            <text x="10" y="46" class="anno-l">电压 U</text><text x="226" y="46" class="anno-n num" text-anchor="end">{{ selBus.read.v.toFixed(1) }} kV</text>
            <text x="10" y="63" class="anno-l">电流 I</text><text x="226" y="63" class="anno-n num" text-anchor="end">{{ selBus.read.i.toFixed(0) }} A</text>
            <text x="10" y="80" class="anno-l">有功 / 无功</text>
            <text x="226" y="80" class="anno-n num" text-anchor="end">{{ selBus.read.p.toFixed(1) }} / {{ selBus.read.q.toFixed(1) }}</text>
            <text x="10" y="94" class="anno-state" :class="selBus.read.state">
              {{ selBus.read.state === 'warn' ? '注意 · 换流阀饱和' : '稳态 · 已收敛' }}
            </text>
          </g>
        </g>

        <!-- 线路参数浮标 -->
        <g v-if="hoveredLine" class="float">
          <rect x="716" y="28" width="264" height="58" />
          <text x="726" y="46" class="float-t">{{ hoveredLine.id }} · {{ hoveredLine.type === 'dc' ? '直流联络' : hoveredLine.type === 'transformer' ? '变压器' : '交流线路' }}</text>
          <text x="726" y="63" class="float-v num">
            {{ hoveredLine.type === 'transformer' ? `R ${hoveredLine.r.toFixed(4)} Ω · X ${hoveredLine.x} H` : `${hoveredLine.km} km · R ${hoveredLine.r.toFixed(4)} Ω · C ${hoveredLine.c.toExponential(2)} F` }}
          </text>
          <text x="726" y="78" class="float-v num">潮流 {{ hoveredLine.flow > 0 ? '→' : '←' }} {{ hoveredLine.mw }} MW</text>
        </g>

        <!-- 比例尺 -->
        <g class="scalebar">
          <line x1="20" y1="580" x2="150" y2="580" />
          <line x1="20" y1="576" x2="20" y2="584" />
          <line x1="150" y1="576" x2="150" y2="584" />
          <line x1="85" y1="576" x2="85" y2="584" />
          <text x="20" y="572" class="scale-t num">0</text>
          <text x="150" y="572" class="scale-t num" text-anchor="end">100 km</text>
        </g>

        <!-- 图例 -->
        <g class="legend">
          <text x="806" y="42" class="note-h">图例</text>
          <line x1="806" y1="60" x2="828" y2="60" class="busbar" />
          <text x="836" y="63" class="note-l">母线 · 长度示电压等级</text>
          <circle cx="817" cy="78" r="6" class="sym" />
          <text x="836" y="81" class="note-l">发电机组</text>
          <rect x="810" y="92" width="14" height="11" class="sym" />
          <text x="836" y="100" class="note-l">换流阀 / 变流器</text>
          <path d="M 817 114 L 824 126 L 810 126 Z" class="sym" />
          <text x="836" y="123" class="note-l">负荷</text>
          <circle cx="817" cy="137" r="4.5" class="trafo-c" />
          <circle cx="817" cy="145" r="4.5" class="trafo-c" />
          <text x="836" y="144" class="note-l">变压器</text>
        </g>

        <!-- 图纸说明 -->        <g class="notes">
          <text x="24" y="44" class="note-h">说明</text>
          <text x="24" y="60" class="note-l">1 · 线路参数为整段有名值，未按 km 折算。</text>
          <text x="24" y="74" class="note-l">2 · 虚线段为直流联络，双圆为变压器符号。</text>
          <text x="24" y="88" class="note-l">3 · 潮流箭头指向实际功率方向，非正方向。</text>
        </g>
      </svg>

      <TitleBlock :selected="selBus.name" />
    </div>
  </section>
</template>

<style scoped>
.stage {
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: var(--s3);
  min-height: 0;
}

.stage-top {
  min-width: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--s5);
}

.sheet-name h2 {
  margin: 2px 0 6px;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.kvs {
  display: flex;
  overflow: hidden;
  align-items: center;
  gap: var(--s3);
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--t3);
}
.kvs span { white-space: nowrap; }
.kvs .sw { display: inline-block; width: 12px; height: 2px; margin-right: 5px; vertical-align: middle; background: var(--c); }
.kvs-sep { width: 1px; height: 9px; background: var(--rule); }

.layers { display: flex; align-items: center; gap: 2px; overflow: hidden; }
.layers .eyebrow { margin-right: var(--s2); }
.layer {
  white-space: nowrap;
  padding: 6px 12px;
  font-size: 11.5px;
  color: var(--t3);
  border-radius: var(--r-pill);
  transition: color 0.15s, background 0.15s;
}
.layer:hover { color: var(--t1); }
.layer.pending { color: var(--t4); }
.layer.on { color: var(--sig-ice); background: var(--sig-dim); }

.paper {
  position: relative;
  min-height: 0;
  border: 1px solid var(--rule);
  border-radius: var(--r-md);
  box-shadow: var(--paper-shadow);
  background: var(--paper-bg);
  overflow: hidden;
}

.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--rule-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--rule-soft) 1px, transparent 1px),
    linear-gradient(rgba(140, 195, 255, 0.20) 1px, transparent 1px),
    linear-gradient(90deg, rgba(140, 195, 255, 0.20) 1px, transparent 1px);
  background-size: 20px 20px, 20px 20px, 100px 100px, 100px 100px;
  pointer-events: none;
}

.reg { position: absolute; width: 9px; height: 9px; border: 1px solid var(--rule-strong); pointer-events: none; }
.reg.tl { left: 8px; top: 8px; border-right: 0; border-bottom: 0; }
.reg.tr { right: 8px; top: 8px; border-left: 0; border-bottom: 0; }
.reg.bl { left: 8px; bottom: 8px; border-right: 0; border-top: 0; }
.reg.br { right: 8px; bottom: 8px; border-left: 0; border-top: 0; }

.refs-top {
  position: absolute;
  top: 6px;
  left: 44px;
  right: 44px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}
.refs-left {
  position: absolute;
  left: 6px;
  top: 52px;
  bottom: 52px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}
.ref { font-size: 8px; color: var(--t4); letter-spacing: 1px; }

.canvas { position: relative; width: 100%; height: 100%; display: block; }

/* 线路 */
.route { fill: none; stroke: var(--line); stroke-width: 1.4; transition: stroke 0.15s, opacity 0.2s; cursor: crosshair; }
.route.tr { stroke: var(--line-dim); stroke-width: 1.2; }
.route.dc { stroke: var(--line-dc); stroke-width: 1.1; stroke-dasharray: 8 4; }
.route.hot { stroke: var(--sig-ice); stroke-width: 1.8; }
.arrow path { fill: none; stroke: var(--sig-ice); stroke-width: 1.4; opacity: 0.95; }

/* 母线 */
.busbar { stroke: var(--sig); stroke-width: 3; stroke-linecap: round; }
.node.dim { opacity: 0.5; }
.node.warn .busbar { stroke: var(--alarm); }
.node.warn .sym { stroke: var(--alarm); }
.node.warn .nm { fill: var(--alarm); }
.node { cursor: pointer; }
.node .sym { fill: var(--sym-fill); stroke: var(--sig-ice); stroke-width: 1.2; }
.node .sym-thin { fill: none; stroke: var(--sig-ice); stroke-width: 0.9; stroke-linecap: round; }
.node .stem { stroke: var(--line-dim); stroke-width: 1; }
.node .warn-halo { fill: rgba(240, 163, 94, 0.10); stroke: var(--alarm); stroke-width: 1; }
.node .halo { fill: none; stroke: var(--sig-ice); stroke-width: 1; opacity: 0.4; }
.node .tag { font-family: var(--font-mono); font-size: 9.5px; fill: var(--t4); text-anchor: middle; letter-spacing: 0.8px; }
.node .nm { font-size: 12.5px; fill: var(--t2); transition: fill 0.15s; }
.node .kv { font-size: 11.5px; fill: var(--t3); }
.node .kv-u { font-family: var(--font-mono); font-size: 8px; fill: var(--t4); }
.node .unit-nm { font-size: 10.5px; fill: var(--t3); font-family: var(--font-mono); }
.node .unit-mw { font-size: 10.5px; fill: var(--t4); }
.node .warn-dot { fill: var(--alarm); }
.node:hover .nm, .node.on .nm { fill: var(--t1); }
.node:hover .busbar, .node.on .busbar { stroke: var(--sig-ice); }

/* 变压器 */
.trafo-c { fill: var(--sym-fill); stroke: var(--sig-ice); stroke-width: 1; }

/* 标注 */
.leader path { fill: none; stroke: var(--sig-ice); stroke-width: 1.2; opacity: 0.95; }
.anchor { fill: var(--sig-ice); }
.anchor-ring { fill: none; stroke: var(--sig-ice); stroke-width: 1; opacity: 0.7; }
.anno-box { fill: var(--ink-1); fill-opacity: 0.97; stroke: var(--rule-strong); rx: 6; }
.anno-h { font-size: 13px; fill: var(--t1); font-weight: 600; }
.anno-rule { stroke: var(--rule); }
.anno-l { font-size: 10.5px; fill: var(--t4); font-family: var(--font-mono); letter-spacing: 0.5px; }
.anno-n { font-size: 14.5px; fill: var(--t1); }
.anno-state { font-size: 10.5px; font-family: var(--font-mono); letter-spacing: 0.4px; }
.anno-state.normal { fill: var(--sig-ice); }
.anno-state.warn { fill: var(--alarm); }

/* 浮标 */
.float rect { fill: var(--float-bg); stroke: var(--rule-strong); }
.float-t { font-size: 10px; fill: var(--t1); }
.float-v { font-size: 9px; fill: var(--t2); }

/* 比例尺与说明 */
.scalebar line { stroke: var(--t4); stroke-width: 1; }
.scale-t { font-size: 8px; fill: var(--t4); }
.note-h { font-size: 10.5px; fill: var(--t3); font-family: var(--font-mono); letter-spacing: 1px; }
.note-l { font-size: 11.5px; fill: var(--t3); }
.alert {
  position: absolute;
  right: 20px;
  bottom: 74px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  border-left: 2px solid var(--alarm);
  background: rgba(240, 163, 94, 0.10);
  font-size: 10px;
  color: var(--alarm);
  pointer-events: none;
}
.alert-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border: 1px solid var(--alert-bd);
  border-radius: var(--r-md);
  background: var(--alert-bg);
  color: var(--alert-fg);
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.3px;
}
.alert-strip b {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.2px;
  padding: 3px 10px;
  border-radius: var(--r-pill);
  background: var(--badge-bg);
  color: var(--badge-fg);
}
.alert-strip strong { font-weight: 700; }
.alert-strip em { margin-left: auto; font-style: normal; font-size: 13px; opacity: 0.95; }
@media (max-width: 1700px) {
  .sheet-name h2 { font-size: 19px; }
  .layer { padding: 4px 6px; font-size: 10px; }
  .kvs { gap: 8px; font-size: 9px; }
  .kvs .kvs-sep { display: none; }
  .kvs .unit { display: none; }
}</style>
