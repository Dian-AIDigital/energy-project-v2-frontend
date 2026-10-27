<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue"
import { useDashboardStore } from "../stores/dashboard"
import type { TopoEdge, TopoNode } from "../types"

const store = useDashboardStore()

const topo = computed(() => store.currentTopology)
const nodes = computed<TopoNode[]>(() => (topo.value?.nodes ?? []) as TopoNode[])
const edges = computed<TopoEdge[]>(() => (topo.value?.edges ?? []) as TopoEdge[])

/* ---------------- 图纸抬头 ---------------- */

const COL_REFS = ["A", "B", "C", "D", "E", "F"]
const ROW_REFS = ["1", "2", "3", "4"]

const today = new Date()
const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`

/** 抬头电压图例：按当前拓扑里真实出现的母线电压等级分组（机组侧电压不进抬头） */
const kvGroups = computed(() => {
  const levels = [
    ...new Set(
      nodes.value
        .filter((n) => {
          const s = `${n.kind ?? ""} ${n.sub ?? ""} ${n.name ?? ""}`
          return !/unit|机组/i.test(s)
        })
        .map((n) => Number(n.kv) || 0)
        .filter((k) => k > 0)
    )
  ]
    .sort((a, b) => b - a)
    .slice(0, 6)
  const fmt = (arr: number[]) => `${arr.map((v) => (Number.isInteger(v) ? v : v.toFixed(1))).join(" / ")} kV`
  const high = levels.filter((k) => k >= 500)
  const mid = levels.filter((k) => k >= 200 && k < 500)
  const low = levels.filter((k) => k < 200)
  const out: { label: string; color: string }[] = []
  if (high.length) out.push({ label: fmt(high), color: "var(--sig)" })
  if (mid.length) out.push({ label: fmt(mid), color: "var(--sig-ice)" })
  if (low.length) out.push({ label: fmt(low), color: "var(--p3)" })
  return out
})

/* ---------------- 节点类型与符号 ---------------- */

/** 符号种类：图内图例和图上共用同一套 path，保证 1 : 1.5 只是缩放关系 */
type SKey = "station" | "hydro" | "pv" | "wind" | "thermal" | "converter" | "unit" | "load" | "trafo" | "grid"

/** 全部 glyph 以 (0,0) 为中心、边长约 20 的方框绘制（图上按 1.0 用，图例按 0.65 缩） */
const GLYPH: Record<SKey, string> = {
  // 变电站：铁塔（收窄到圆框内，最远半径 ≈10.4）
  station: "M0 -8.5 L-6 8.5 M0 -8.5 L6 8.5 M-4.2 6 H4.2 M-3 1 H3",
  // 水电厂：三道水波（水波横向收窄，最远半径 ≈10.8）
  hydro: "M-10 -4 q5 -4.6 10 0 t10 0 M-10 1 q5 -4.6 10 0 t10 0 M-6 7 q5 -4.2 10 0 t6 0",
  // 光伏电站：斜置光伏板 + 两条栅线（最远半径 ≈9.9）
  pv: "M-8 4 L2 -8 L9 -4 L-1 8 Z M-5.7 5.3 L4.3 -6.7 M-3.3 6.7 L6.7 -5.3",
  // 风电场：塔柱 + 三叶（最远半径 ≈10.5）
  wind: "M0 9 V-2.5 M0 -2.5 V-10.5 M0 -2.5 L6.9 1.5 M0 -2.5 L-6.9 1.5",
  // 火电厂：厂房 + 烟囱（最远半径 ≈10.6）
  thermal: "M-7 8 V-2 H-3 V-8 H4 V8 Z",
  // 换流阀 / 变流器：方波
  converter: "M-12 6 V-2 H-6 V-6 H1 V6 H3 V-2 H12",
  // 发电机组：圆 + 正弦
  unit: "M0 -9 a9 9 0 1 1 0 18 a9 9 0 1 1 0 -18 M-5 0 q3 -4 6 0 t6 0",
  // 负荷：三角 + 内勾
  load: "M0 -10 L10.6 10 H-10.6 Z M-3.4 0.4 L-0.4 4 l4 -5.4",
  // 变压器：线圈（两半圆 + 中柱）
  trafo: "M0 -9 a9 9 0 0 0 0 18 M0 -9 a9 9 0 0 1 0 18 M0 -10.5 V10.5",
  // 主网：方框 + 进线（整体左移，避免压住节点中心）
  grid: "M-46 -11 h21 v22 h-21 Z M-43 -4.5 h13 M-36.5 -9 v18"
}

/** 站名关键词：后端 node_type 不可靠（T7「变电G站」被标成 generator、T4「变电J站」标成 hydro），所以站名优先、类型兜底 */
const STATION_RE = /变电|升压站|送出站|交流输出|交流送出|开闭|开关站/
const UNIT_RE = /unit|机组|generator|thermal|wind_|pv_|hydro_/i

const nodeKindOf = (n: TopoNode) => String(n.kind ?? n.sub ?? "").toLowerCase()

function symKeyOf(n: TopoNode): SKey {
  const kind = nodeKindOf(n)
  const name = String(n.name ?? "")
  const all = `${kind} ${name}`
  if (/换流|柔直|MMC/i.test(all)) return "converter"
  if (STATION_RE.test(name)) return "station"
  if (/变压器|transformer/i.test(all)) return "trafo"
  if (/负荷|load|industry|residential|工厂|居民/i.test(all)) return "load"
  if (/主网|grid|电网/i.test(name)) return "grid"
  // 电厂先按站名认：后端 kind 常把 hydro/pv/wind/thermal 混进机组里（如 T8 的「火电M厂」kind=thermal）
  if (/水电|水电站|hydro/i.test(name)) return "hydro"
  if (/光伏|太阳能|solar|\bpv\b/i.test(name)) return "pv"
  if (/风电|风力|风场|wind/i.test(name)) return "wind"
  if (/火电|燃煤|燃气|热电厂|thermal/i.test(name)) return "thermal"
  // 机组：kind 或名称里带机组/unit/generator
  if (UNIT_RE.test(kind) || /机组|generator|^[a-z]{1,3}\d+$/i.test(name)) return "unit"
  // 站名只有「电厂 / 电站」泛称时，用 kind 兜底细分
  if (/pv|solar/i.test(kind)) return "pv"
  if (/wind/i.test(kind)) return "wind"
  if (/thermal/i.test(kind)) return "thermal"
  return "hydro"
}

/** 电厂族（水电/光伏/风电/火电）：共用同一套配色，只靠符号形状区分 */
const PLANT_KEYS: SKey[] = ["hydro", "pv", "wind", "thermal"]
const isPlantKey = (k: SKey) => PLANT_KEYS.includes(k)
/** 需要圆框的站点：变电站 + 电厂族 */
const isSiteNode = (n: TopoNode) => {
  const k = symKeyOf(n)
  return k === "station" || isPlantKey(k)
}

/** 选中标注引线离符号边缘的距离 */
const MARK_HALF = 10
/** 图上站点圆框半径（图例圆框半径的 1.5 倍：13 / 8.6） */
const SITE_R = 13
const LEGEND_R = 8.6
/** 图例符号相对图上符号的缩放（图上 = 图例 × 1.5） */
const LEGEND_SCALE = 0.65

const siteNodes = computed(() => nodes.value.filter(isSiteNode))

/** 每个节点的「圆框 / 挖空」位置：除主网（符号整体左移绘制）外都以节点中心为圆心 */
const nodeMarks = computed(() =>
  nodes.value.map((n) =>
    symKeyOf(n) === "grid"
      ? { id: n.id, cx: n.x - 35.5, cy: n.y, r: SITE_R + 0.5 }
      : { id: n.id, cx: n.x, cy: n.y, r: SITE_R + 1 }
  )
)

/** 竖直相邻（上下 48px 内有另一个站点）的站点，名称改挂到圆框右侧，避免与下一个圆框相撞 */
const siteSideLabel = computed(() => {
  const sites = siteNodes.value
  const set = new Set<string>()
  for (const a of sites) {
    for (const b of sites) {
      if (a.id === b.id) continue
      const dy = b.y - a.y
      if (Math.abs(a.x - b.x) < 26 && dy > 0 && dy < 48) {
        set.add(a.id)
        break
      }
    }
  }
  return set
})

/** 给节点挂类型 class：station / plant / converter / unit / load / trafo / grid */
const typeClass = (n: TopoNode) => {
  const k = symKeyOf(n)
  if (k === "station") return "station"
  if (isPlantKey(k)) return "plant"
  return k
}

/* 图内图例：只列当前拓扑里实际出现的设备类型，位置按文字宽度累加 */
const LEGEND_DEFS: { key: SKey; label: string }[] = [
  { key: "station", label: "变电站" },
  { key: "hydro", label: "水电厂" },
  { key: "pv", label: "光伏电站" },
  { key: "wind", label: "风电场" },
  { key: "thermal", label: "火电厂" },
  { key: "converter", label: "换流阀 / 变流器" },
  { key: "unit", label: "发电机组" },
  { key: "load", label: "负荷" },
  { key: "trafo", label: "变压器" }
]
const SHORT_COND: Record<string, string> = {
  s1: "典型日",
  s2: "极端天气",
  s3: "故障恢复",
  s4: "高比例新能源",
  s5: "冬季低温",
  s6: "多源协同"
}
const shortCond = (id: string) => SHORT_COND[id] ?? id
const activeCond = computed(() => (store.condition || "").replace(/场景$/, ""))
const pickCond = (id: string) => store.applyScenario(id)
/** 粗估文字宽度：中文 11px、其它 6px */
const textWidth = (s: string) => [...s].reduce((w, ch) => w + (/[\u4e00-\u9fa5]/.test(ch) ? 11 : 6), 0)

/** 图内图例配色：与图上同一套 CSS 变量 */
function legendColor(k: SKey): string {
  if (k === "station") return "var(--c-station)"
  if (isPlantKey(k)) return "var(--c-plant)"
  if (k === "converter") return "var(--c-conv)"
  if (k === "unit") return "var(--c-unit)"
  if (k === "load") return "var(--c-load)"
  if (k === "trafo") return "var(--c-trafo)"
  return "var(--c-grid)"
}

/** 图内图例：只列当前拓扑里实际出现的设备类型，整块贴图纸右上角，宽度自适应 */
const LEGEND_RIGHT = 982
const LEGEND_PAD = 14

const legendItems = computed(() => {
  const present = new Set(nodes.value.map((n) => symKeyOf(n)))
  const list = LEGEND_DEFS.filter((d) => present.has(d.key))
  const TITLE_W = 24
  const SEP_GAP = 20
  const GAP = 22
  let x = LEGEND_PAD + TITLE_W + SEP_GAP
  const rel = list.map((d) => {
    const cx = x + LEGEND_R
    const tx = x + LEGEND_R * 2 + 6
    const item = { ...d, cx, tx }
    x = tx + textWidth(d.label) + GAP
    return item
  })
  const width = rel.length ? x - GAP + LEGEND_PAD : LEGEND_PAD * 2 + TITLE_W
  const left = LEGEND_RIGHT - width
  return {
    width,
    x: left,
    titleX: left + LEGEND_PAD,
    sepX: left + LEGEND_PAD + TITLE_W + 8,
    items: rel.map((it) => ({ ...it, cx: it.cx + left, tx: it.tx + left }))
  }
})

/* ---------------- 线路几何 ---------------- */

const byBus = computed(() => {
  const m = new Map<string, TopoNode>()
  for (const n of nodes.value) if (n.bus_id != null) m.set(String(n.bus_id), n)
  return m
})

function route(a: TopoNode, b: TopoNode) {
  if (Math.abs(a.y - b.y) < 3) return `M ${a.x} ${a.y} H ${b.x}`
  if (Math.abs(a.x - b.x) < 3) return `M ${a.x} ${a.y} V ${b.y}`
  const midY = (a.y + b.y) / 2
  return `M ${a.x} ${a.y} V ${midY} H ${b.x} V ${b.y}`
}

type EdgeGeo = {
  e: TopoEdge
  d: string
  mx: number
  my: number
  angle: number
  type: "ac" | "dc" | "transformer"
}

const edgeGeos = computed<EdgeGeo[]>(() => {
  const out: EdgeGeo[] = []
  for (const e of edges.value) {
    const a = byBus.value.get(String(e.from))
    const b = byBus.value.get(String(e.to))
    if (!a || !b) continue
    const horizontal = Math.abs(a.y - b.y) < 3
    const mx = horizontal ? (a.x + b.x) / 2 : b.x
    const my = horizontal ? a.y : (a.y + b.y) / 2
    const angle = horizontal ? (a.x < b.x ? 0 : 180) : a.y < b.y ? 90 : -90
    out.push({ e, d: route(a, b), mx, my, angle, type: (e.lineType ?? "ac") as EdgeGeo["type"] })
  }
  return out
})

/* ---------------- 选中 / 悬停 ---------------- */

const sel = computed<TopoNode | null>(() => nodes.value.find((n) => n.id === store.selectedNodeId) ?? null)

const isNeighbour = (n: TopoNode) => {
  const s = sel.value
  if (!s) return true
  return edges.value.some(
    (e) =>
      (String(e.from) === String(s.bus_id) && String(e.to) === String(n.bus_id)) ||
      (String(e.to) === String(s.bus_id) && String(e.from) === String(n.bus_id))
  )
}

const hoverEdgeId = ref<string | null>(null)
const hoveredEdge = computed(() => edgeGeos.value.find((g) => g.e.id === hoverEdgeId.value) ?? null)

const edgeKindText = (t: string) => (t === "dc" ? "直流联络" : t === "transformer" ? "变压器" : "交流线路")

/** 引出标注框：在节点四周四个候选位里挑「压到节点最少」的那个 */
const anno = computed(() => {
  const n = sel.value
  if (!n) return null
  const w = 236
  const h = 134
  const clampX = (x: number) => Math.min(Math.max(18, x), 1000 - w - 18)
  // 下限 118：不让标注框滑进顶部「说明 / 图内图例」那一条
  const clampY = (y: number) => Math.min(Math.max(118, y), 655 - h - 70)
  const cands = [
    { x: clampX(n.x + 46), y: clampY(n.y - h - 24), side: "right" as const },
    { x: clampX(n.x + 46), y: clampY(n.y + 28), side: "right" as const },
    { x: clampX(n.x - w - 46), y: clampY(n.y - h - 24), side: "left" as const },
    { x: clampX(n.x - w - 46), y: clampY(n.y + 28), side: "left" as const }
  ]
  const hits = (c: { x: number; y: number }) =>
    nodes.value.filter((o) => o.x > c.x - 8 && o.x < c.x + w + 8 && o.y > c.y - 8 && o.y < c.y + h + 8).length
  let best = cands[0]
  for (const c of cands) if (hits(c) < hits(best)) best = c
  return { ...best, w, h }
})

/** 标注框里的读数：与右侧「拓扑节点状态信息」表同源 */
const selRead = computed(() => {
  const n = sel.value
  if (!n) return null
  const m = store.measurements.find((x) => x.nodeId === n.id)
  return {
    v: m ? m.voltageKv : Number(n.kv) || 0,
    i: m ? m.currentA : 0,
    p: m ? m.powerMw : Number(n.mw) || 0
  }
})

/* ---------------- 上一张 / 下一张拓扑（接续 main 上 5c360c8 的交互） ---------------- */

function stepTopology(step: number) {
  const list = store.topologies
  if (!list.length) return
  const i = list.findIndex((t) => t.id === store.currentTopologyId)
  const next = list[(i + step + list.length) % list.length]
  if (next) store.setTopology(next.id)
}


/* ---------------- 全屏播放 ---------------- */

const sheetRef = ref<HTMLElement | null>(null)
const isFull = ref(false)
/** 浏览器拒绝 Fullscreen API 时退化为「页面内全屏」 */
const fsFallback = ref(false)
const isFullMode = computed(() => isFull.value || fsFallback.value)

function syncFull() {
  isFull.value = document.fullscreenElement === sheetRef.value
}

onMounted(() => document.addEventListener("fullscreenchange", syncFull))
onUnmounted(() => document.removeEventListener("fullscreenchange", syncFull))

async function toggleFull() {
  if (fsFallback.value) {
    fsFallback.value = false
    resetView()
    return
  }
  if (document.fullscreenElement === sheetRef.value) {
    await document.exitFullscreen().catch(() => undefined)
    return
  }
  const el = sheetRef.value
  if (!el) return
  try {
    await el.requestFullscreen()
  } catch {
    fsFallback.value = true
  }
  resetView()
}

/* ---------------- 缩放 / 平移 ---------------- */

const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
let dragging = false
let startX = 0
let startY = 0

function onWheel(e: WheelEvent) {
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  zoom.value = Math.max(0.6, Math.min(zoom.value * delta, 4))
}
function onDown(e: MouseEvent) {
  dragging = true
  startX = e.clientX - panX.value
  startY = e.clientY - panY.value
}
function onMove(e: MouseEvent) {
  if (!dragging) return
  panX.value = e.clientX - startX
  panY.value = e.clientY - startY
}
function onUp() {
  dragging = false
}
function resetView() {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
}

/* 拓扑切换后：清空缩放，并把选中落到第一个节点 */
watch(
  () => store.currentTopologyId,
  () => {
    resetView()
    const list = nodes.value
    if (list.length && !list.some((n) => n.id === store.selectedNodeId)) store.selectNode(list[0].id)
  },
  { immediate: true }
)

watch(
  nodes,
  (list) => {
    if (list.length && !list.some((n) => n.id === store.selectedNodeId)) store.selectNode(list[0].id)
  },
  { immediate: true }
)
</script>

<template>
  <section class="sheet" ref="sheetRef" :class="{ 'is-full': isFullMode }" aria-label="拓扑单线图">
    <header class="sheet-top">
      <div class="sheet-name">
        
        <span class="eyebrow">单线图 / ONE-LINE</span>
        <h2>{{ topo?.name || "拓扑单线图" }}</h2>
        <div class="kvs">
          <span v-for="g in kvGroups" :key="g.label">
            <i class="sw" :style="{ background: g.color }" />{{ g.label }}
          </span>
          <span class="kvs-sep" />
          <span class="unit">节点点击可切换档案 · 悬停线路读参数 · 滚轮缩放</span>
        </div>
        
      </div>
            <!-- 🌟 加在这里 -->
      <div class="layers" aria-label="场景标签">
        <button
          v-for="s in store.scenarios"
          :key="s.id"
          class="layer"
          :class="{ on: activeCond === shortCond(s.id), pending: s.status === 'pending' }"
          @click="pickCond(s.id)"
        >
          {{ shortCond(s.id) }}
        </button>
      </div>

      <button
        class="fs-btn"
        :class="{ on: isFullMode }"
        :title="isFullMode ? '退出全屏（Esc）' : '全屏播放这张拓扑图'"
        :aria-pressed="isFullMode"
        @click="toggleFull"
      >
        <svg width="16" height="16" viewBox="0 0 12 12" aria-hidden="true">
          <path
            v-if="!isFullMode"
            d="M1 4.2V1h3.2M11 7.8V11H7.8M1 7.8V11h3.2M11 4.2V1H7.8"
            fill="none"
            stroke="currentColor"
            stroke-width="1.35"
            stroke-linecap="round"
          />
          <path
            v-else
            d="M4.2 1v3.2H1M7.8 11V7.8H11M7.8 1v3.2H11M4.2 11V7.8H1"
            fill="none"
            stroke="currentColor"
            stroke-width="1.35"
            stroke-linecap="round"
          />
        </svg>
        {{ isFullMode ? "退出" : "全屏" }}
      </button>
    </header>

    <div v-if="isFullMode" class="fs-tip">全屏播放中 · 滚轮缩放 / 拖拽平移 / 双击复位 · 按 Esc 退出</div>

    <div class="paper">
      <div class="grid-bg" />
      <span class="reg tl" /><span class="reg tr" /><span class="reg bl" /><span class="reg br" />

      <div class="refs-top">
        <span v-for="c in COL_REFS" :key="'c' + c" class="ref">{{ c }}</span>
      </div>
      <div class="refs-left">
        <span v-for="r in ROW_REFS" :key="'r' + r" class="ref">{{ r }}</span>
      </div>

      <svg
        class="canvas"
        viewBox="0 0 1000 655"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="电网拓扑单线图"
        @wheel.prevent="onWheel"
        @mousedown="onDown"
        @mousemove="onMove"
        @mouseup="onUp"
        @mouseleave="onUp"
        @dblclick="resetView"
      >
        <!-- 图内图例带在 y 18–64；绘图内容裁到 y≥70，缩放/拖拽也不会画进图例带 -->
        <defs>
          <clipPath id="fieldClip">
            <rect x="0" y="70" width="1000" height="585" />
          </clipPath>
          <!-- 符号圆框处的连线挖空：白底保留、每个符号位置挖黑，线路经过符号时自动断开 -->
          <mask id="siteMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="655">
            <rect x="0" y="0" width="1000" height="655" fill="#fff" />
            <circle v-for="m in nodeMarks" :key="'m' + m.id" :cx="m.cx" :cy="m.cy" :r="m.r" fill="#000" />
          </mask>
        </defs>

        <g clip-path="url(#fieldClip)">
          <transition name="topo-fade" mode="out-in">
          <g class="drawing" :key="topo?.id" :transform="`translate(${panX} ${panY}) scale(${zoom})`">
          <!-- 线路 -->
          <g class="lines" mask="url(#siteMask)">
            <template v-for="g in edgeGeos" :key="'l' + g.e.id">
              <path
                :d="g.d"
                class="route"
                :class="[g.type, { hot: hoverEdgeId === g.e.id }]"
                @mouseenter="hoverEdgeId = g.e.id"
                @mouseleave="hoverEdgeId = null"
              />
              <g v-if="g.type !== 'transformer'" class="arrow" :transform="`translate(${g.mx} ${g.my}) rotate(${g.angle})`">
                <path d="M -6 -3.5 L 0 0 L -6 3.5" />
              </g>
              <text :x="g.mx" :y="g.my - 5" class="br-no">{{ String(g.e.code ?? "").padStart(2, "0") }}</text>
            </template>
          </g>

          <!-- 节点 -->
          <g class="nodes">
            <g
              v-for="n in nodes"
              :key="n.id"
              class="node"
              :class="[symKeyOf(n), typeClass(n), { on: n.id === store.selectedNodeId, dim: sel && n.id !== sel.id && !isNeighbour(n) }]"
              @click="store.selectedNodeId === n.id ? store.selectNode('') : store.selectNode(n.id)"
            >
              <circle :cx="n.x" :cy="n.y" :r="SITE_R + 6" fill="transparent" style="cursor: pointer;" />
              <!-- 符号圆框（除主网外全部节点），框内连线已被蒙版挖空 -->
              <circle v-if="symKeyOf(n) !== 'grid'" class="site-ring" :cx="n.x" :cy="n.y" :r="SITE_R" />

              <!-- 符号：与图内图例同一套 path，图上按 1.0 画（图例按 0.65，正好 1.5 倍） -->
              <path class="glyph" :transform="`translate(${n.x} ${n.y})`" :d="GLYPH[symKeyOf(n)]" />

              <!-- 选中光晕 -->
              <circle v-if="n.id === store.selectedNodeId" :cx="n.x" :cy="n.y" r="16" class="halo" />

              <!-- 名称：单行（电压在抬头、右侧状态表与引出标注里看） -->
              <template v-if="symKeyOf(n) === 'unit'">
                <text :x="n.x + SITE_R + 4" :y="n.y + 3" class="unit-nm">{{ n.name }}</text>
                <text v-if="n.mw" :x="n.x + SITE_R + 4" :y="n.y + 16" class="unit-mw">{{ Math.round(Number(n.mw)) }} MW</text>
              </template>
              <template v-else-if="symKeyOf(n) === 'load'">
                <text :x="n.x + SITE_R + 4" :y="n.y + 1" class="nm">{{ n.name }}</text>
                <text :x="n.x + SITE_R + 4" :y="n.y + 14" class="kv">{{ n.kv || "—" }} <tspan class="kv-u">kV</tspan></text>
              </template>
              <template v-else-if="symKeyOf(n) === 'trafo'">
                <text :x="n.x + SITE_R + 4" :y="n.y + 4" class="nm">{{ n.name }}</text>
              </template>
              <template v-else-if="symKeyOf(n) === 'converter'">
                <text :x="n.x" :y="n.y + SITE_R + 14" class="nm">{{ n.name }}</text>
              </template>
              <template v-else-if="symKeyOf(n) === 'grid'">
                <text :x="n.x" :y="n.y + 23" class="nm">{{ n.name }}</text>
              </template>
              <template v-else>
                <text
                  :x="siteSideLabel.has(n.id) ? n.x + SITE_R + 5 : n.x"
                  :y="siteSideLabel.has(n.id) ? n.y + 4 : n.y + SITE_R + 14"
                  class="nm"
                  :class="{ 'site-nm': siteSideLabel.has(n.id) }"
                >{{ n.name }}</text>
              </template>
            </g>
          </g>
          </g>
          </transition>
        </g>

        <!-- 引出线与标注：跟随缩放平移，但不被裁剪（它可以靠近顶部） -->
        <g class="leader-layer" :transform="`translate(${panX} ${panY}) scale(${zoom})`">
          <g v-if="anno && sel" class="leader">
            <path
              :d="
                anno.side === 'left'
                  ? `M ${sel.x - MARK_HALF - 2} ${sel.y} H ${anno.x + anno.w + 12} L ${anno.x + anno.w} ${anno.y + 52}`
                  : `M ${sel.x} ${sel.y - MARK_HALF - 2} V ${anno.y + anno.h} H ${anno.x + (anno.x + anno.w <= sel.x ? anno.w : 0)}`
              "
            />
            <circle
              class="anchor"
              :cx="anno.side === 'left' ? sel.x - MARK_HALF - 2 : sel.x"
              :cy="anno.side === 'left' ? sel.y : sel.y - MARK_HALF - 2"
              r="2"
            />
            <g :transform="`translate(${anno.x} ${anno.y})`">
              <rect :width="anno.w" :height="anno.h" class="anno-box" />
              <path :d="`M 4 12 V ${anno.h - 12}`" class="anno-accent" />
              <text x="16" y="22" class="anno-h">{{ sel.name }}</text>
              <text @click.stop="store.selectNode('')" :x="anno.w - 14" y="20" class="anno-close" text-anchor="end">✕</text>
              <text :x="anno.w - 32" y="22" class="anno-h num" text-anchor="end">{{ sel.kv || "—" }} kV</text>
              <line x1="16" y1="33" :x2="anno.w - 14" y2="33" class="anno-rule" />
              <text x="16" y="56" class="anno-l">电压 U</text>
              <text :x="anno.w - 14" y="56" class="anno-n" text-anchor="end">{{ (selRead?.v ?? 0).toFixed(1) }} kV</text>
              <text x="16" y="79" class="anno-l">电流 I</text>
              <text :x="anno.w - 14" y="79" class="anno-n" text-anchor="end">{{ Math.round(selRead?.i ?? 0) }} A</text>
              <text x="16" y="102" class="anno-l">有功 / 无功</text>
              <text :x="anno.w - 14" y="102" class="anno-n" text-anchor="end">
                {{ (selRead?.p ?? 0).toFixed(1) }} / —
              </text>
              <circle cx="20" cy="118" r="2.4" class="anno-dot" />
              <text x="29" y="122" class="anno-state">稳态 · 已收敛</text>
            </g>
          </g>
        </g>

        <!-- 图纸说明：HTML（foreignObject）以便字号调大并可上下滚动；固定在顶带内 -->
        <foreignObject x="14" y="18" width="332" height="106" class="notes-fo">
          <div xmlns="http://www.w3.org/1999/xhtml" class="sheet-notes">
            <div class="notes-head">
              <i class="notes-tick" />
              <span>说明</span>
            </div>
            <div class="notes-body">
              <p><b>1</b>线路参数为整段有名值，未按 km 折算。</p>
              <p><b>2</b>虚线段为直流联络，箭头指向实际功率方向。</p>
              <p class="dim"><b>3</b>变压器 / 直流按电压与站名推导（后端未分类）。</p>
            </div>
          </div>
        </foreignObject>

        <!-- 图内图例（圆形边框 + 象形符号；底板不透明，压住的网格/连线不再透出） -->
        <!-- 图内图例：贴图纸右上角；只列本图出现的类型；符号与图上同一套 path（图上 = 图例 × 1.5） -->
        <g class="legend">
          <rect class="note-patch" :x="legendItems.x" y="18" :width="legendItems.width" height="46" rx="4" />
          <text :x="legendItems.titleX" y="46" class="legend-h">图例</text>
          <line class="legend-sep" :x1="legendItems.sepX" y1="32" :x2="legendItems.sepX" y2="54" />

          <g v-for="it in legendItems.items" :key="'lg' + it.key">
            <circle
              class="chip-ring"
              :cx="it.cx"
              cy="42"
              :r="LEGEND_R"
              :style="{ stroke: legendColor(it.key) }"
            />
            <path
              class="glyph"
              :transform="`translate(${it.cx} 42) scale(${LEGEND_SCALE})`"
              :d="GLYPH[it.key]"
              :style="{ stroke: legendColor(it.key) }"
            />
            <text :x="it.tx" y="46" class="legend-l" :style="{ fill: legendColor(it.key) }">{{ it.label }}</text>
          </g>
        </g>

        <!-- 比例尺（不随缩放） -->
        <g class="scalebar">
          <line x1="24" y1="628" x2="224" y2="628" />
          <line x1="24" y1="617" x2="24" y2="639" />
          <line x1="124" y1="621" x2="124" y2="635" />
          <line x1="224" y1="617" x2="224" y2="639" />
          <text x="24" y="610" class="scale-t">0</text>
          <text x="124" y="610" class="scale-t mid" text-anchor="middle">50</text>
          <text x="224" y="610" class="scale-t" text-anchor="end">100 km</text>
        </g>

        <!-- 线路参数浮标（不随缩放） -->
        <g v-if="hoveredEdge" class="float">
          <rect x="24" y="290" width="272" height="60" />
          <text x="34" y="308" class="float-t">
            {{ String(hoveredEdge.e.code ?? "").padStart(2, "0") }} · {{ edgeKindText(hoveredEdge.type) }}
            <tspan v-if="hoveredEdge.type !== 'ac'">（推导）</tspan>
          </text>
          <text x="34" y="324" class="float-v">
            <template v-if="hoveredEdge.e.km">{{ hoveredEdge.e.km }} km · </template>R {{ (hoveredEdge.e.r ?? 0).toFixed(4) }} Ω · L
            {{ (hoveredEdge.e.l ?? 0).toExponential(2) }} H
          </text>
          <text x="34" y="339" class="float-v">
            C {{ (hoveredEdge.e.c ?? 0).toExponential(2) }} F · 额定 {{ (hoveredEdge.e.iRated ?? 0).toFixed(0) }} A
          </text>
        </g>
      </svg>

      <!-- 图签 -->
      <div class="tb" aria-label="图签">
        <div class="tb-row">
          <div class="tb-cell wide"><span class="k">项目</span><span class="v">新能源荷储平台</span></div>
          <div class="tb-cell"><span class="k">图号</span><span class="v num">NESP-2603</span></div>
        </div>
        <div class="tb-row">
          <div class="tb-cell"><span class="k">选中</span><span class="v">{{ sel?.name || "—" }}</span></div>
          <div class="tb-cell"><span class="k">比例</span><span class="v num">1 : 1</span></div>
          <div class="tb-cell"><span class="k">日期</span><span class="v num">{{ stamp }}</span></div>
          <div class="tb-cell"><span class="k">校核</span><span class="v">内核 v1</span></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ---- 图纸配色：暗底蓝图（方格结构不变），只在拓扑区内生效 ---- */
.sheet,
.paper {
  --sig: #5fe0ff;
  --sig-ice: #d9f7ff;
  --sig-dim: rgba(95, 224, 255, 0.18);
  --alarm: #ffbe61;
  --rule: rgba(95, 224, 255, 0.26);
  --rule-strong: rgba(95, 224, 255, 0.55);
  --paper-bg: linear-gradient(180deg, #0d263b 0%, #071624 100%);
  --paper-shadow: 0 0 0 1px rgba(95, 224, 255, 0.18), 0 10px 30px rgba(0, 0, 0, 0.5);
  --grid-minor: rgba(95, 224, 255, 0.11);
  --grid-major: rgba(95, 224, 255, 0.26);
  --line: rgba(205, 240, 253, 0.95);
  --line-dim: rgba(160, 205, 226, 0.7);
  --line-dc: rgba(127, 228, 255, 1);
  --float-bg: #06121f;
  --p1: #ffffff;
  --p2: #dcf0fa;
  --p3: #aacde2;
  --p4: #7ea6c2;

  /* 设备类型色：都挑与深蓝底区分度高、彼此也能分得开的色 */
  --c-station: #f4ead4;
  --c-plant: #ffb95e;
  --c-conv: #5fe0ff;
  --c-unit: #7bf0c4;
  --c-load: #c0a8ff;
  --c-trafo: #ffd479;
  --c-grid: #e6eef5;
}

.sheet {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  padding: 10px 12px 12px;
  /* 抬头带：压深一档的"图框"底，和下面的方格区拉开层次 */
  background: linear-gradient(180deg, #061320 0%, #030b14 100%);
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(95, 224, 255, 0.12), 0 8px 26px rgba(0, 0, 0, 0.45);
  color: var(--p2);
}

/* ---- 抬头 ---- */
.sheet-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 8px;
  flex: none;
}
.eyebrow {
  font-size: 9.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--p4);
  font-family: var(--font-mono);
}
.sheet-name h2 {
  margin: 2px 0 5px;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: var(--p1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 520px;
}
.kvs {
  display: flex;
  align-items: center;
  gap: 11px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--p3);
}
.kvs span {
  white-space: nowrap;
}
.kvs .sw {
  display: inline-block;
  width: 12px;
  height: 2px;
  margin-right: 5px;
  vertical-align: middle;
}
.kvs-sep {
  width: 1px;
  height: 9px;
  background: var(--rule);
}
.kvs .unit {
  font-family: var(--font-body);
  font-size: 10.5px;
  color: var(--p4);
}
.layers {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: none;
}
.layers .eyebrow {
  margin-right: 8px;
}
.layer {
  white-space: nowrap;
  padding: 5px 10px;
  font-size: 11px;
  color: var(--p3);
  background: transparent;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}
.layer:hover {
  color: var(--sig-ice);
  background: rgba(95, 224, 255, 0.08);
}
.layer.pending {
  color: var(--p4);
}
.layer.on {
  color: var(--sig-ice);
  background: var(--sig-dim);
  font-weight: 500;
}

/* ---- 上一张 / 下一张拓扑 ---- */
.topo-nav {
  display: inline-flex;
  gap: 3px;
  margin-left: 10px;
  flex: none;
}
.nav-btn {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0 2px;
  font-size: 15px;
  line-height: 1;
  color: var(--p3);
  background: rgba(95, 224, 255, 0.06);
  border: 1px solid rgba(95, 224, 255, 0.22);
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}
.nav-btn:hover {
  color: var(--sig-ice);
  background: rgba(95, 224, 255, 0.14);
  border-color: rgba(95, 224, 255, 0.45);
}
/* 切拓扑时的淡入淡出 */
.topo-fade-enter-active,
.topo-fade-leave-active {
  transition: opacity 0.26s ease;
}
.topo-fade-enter-from,
.topo-fade-leave-to {
  opacity: 0;
}

/* ---- 全屏播放 ---- */
.fs-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 16px;
  padding: 7px 16px;
  font-size: 13px;
  font-family: inherit;
  color: var(--p3);
  background: rgba(95, 224, 255, 0.06);
  border: 1px solid rgba(95, 224, 255, 0.22);
  border-radius: 4px;
  cursor: pointer;
  flex: none;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}
.fs-btn:hover {
  color: var(--sig-ice);
  background: rgba(95, 224, 255, 0.14);
  border-color: rgba(95, 224, 255, 0.45);
}
.fs-btn.on {
  color: var(--sig-ice);
  background: rgba(95, 224, 255, 0.18);
  border-color: rgba(95, 224, 255, 0.5);
}
.fs-tip {
  flex: none;
  margin: -4px 0 8px;
  font-size: 10.5px;
  font-family: var(--font-mono);
  letter-spacing: 0.3px;
  color: var(--sig-ice);
  opacity: 0.72;
}
/* 浏览器全屏与页面内全屏降级：都让图纸铺满 */
.sheet:fullscreen,
.sheet.is-full {
  width: 100%;
  height: 100%;
  padding: 16px 18px 18px;
  background: #030b14;
  border-radius: 0;
}
.sheet.is-full {
  position: fixed;
  inset: 0;
  z-index: 90;
}

/* ---- 图纸：方格绘图区做成一块"场"（比抬头亮一档 + 中心光晕 + 内阴影收边） ---- */
.paper {
  position: relative;
  flex: 1;
  min-height: 0;
  border: 1px solid rgba(95, 224, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
  background:
    radial-gradient(115% 85% at 50% 44%, rgba(42, 128, 182, 0.42) 0%, rgba(14, 50, 78, 0.2) 42%, transparent 72%),
    linear-gradient(180deg, #0e2c48 0%, #071827 100%);
  box-shadow:
    inset 0 0 70px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(95, 224, 255, 0.18),
    0 0 22px rgba(20, 90, 140, 0.28);
}
.grid-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(var(--grid-minor) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-minor) 1px, transparent 1px),
    linear-gradient(var(--grid-major) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-major) 1px, transparent 1px);
  background-size: 20px 20px, 20px 20px, 100px 100px, 100px 100px;
}
.reg {
  position: absolute;
  width: 9px;
  height: 9px;
  border: 1px solid var(--rule-strong);
  pointer-events: none;
}
.reg.tl { left: 7px; top: 7px; border-right: 0; border-bottom: 0; }
.reg.tr { right: 7px; top: 7px; border-left: 0; border-bottom: 0; }
.reg.bl { left: 7px; bottom: 7px; border-right: 0; border-top: 0; }
.reg.br { right: 7px; bottom: 7px; border-left: 0; border-top: 0; }
.refs-top {
  position: absolute;
  top: 5px;
  left: 44px;
  right: 44px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}
.refs-left {
  position: absolute;
  left: 5px;
  top: 46px;
  bottom: 46px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}
.ref {
  font-size: 8px;
  color: var(--p4);
  letter-spacing: 1px;
  font-family: var(--font-mono);
}
.canvas {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  cursor: grab;
}
.canvas:active {
  cursor: grabbing;
}

/* ---- 线路 ---- */
.route {
  fill: none;
  stroke: var(--line);
  stroke-width: 2.1;
  transition: stroke 0.15s, stroke-width 0.15s;
  cursor: crosshair;
  filter: drop-shadow(0 0 3px rgba(140, 230, 255, 0.5));
}
.route.transformer {
  stroke: var(--line-dim);
  stroke-width: 1.9;
}
.route.dc {
  stroke: var(--line-dc);
  stroke-width: 1.8;
  stroke-dasharray: 7 4;
}
.route.hot {
  stroke: #ffffff;
  stroke-width: 2.8;
}
.arrow path {
  fill: var(--sig-ice);
  stroke: var(--sig-ice);
  stroke-width: 2;
  stroke-linejoin: round;
}
.br-no {
  font-family: var(--font-mono);
  font-size: 9px;
  fill: var(--p3);
  text-anchor: middle;
  letter-spacing: 0.4px;
  pointer-events: none;
}

/* ---- 符号：象形线条（纯描边），颜色由类型决定 ---- */
.glyph {
  fill: none;
  stroke: var(--sig-ice);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.legend .glyph {
  stroke-width: 1.4;
}
/* 图例圆框：每项一枚，颜色跟类型走 */
.chip-ring {
  fill: rgba(6, 18, 31, 0.9);
  stroke-width: 1.2;
  opacity: 0.95;
}
/* 图上站点圆框：只描边不填充，框内的连线由 siteMask 挖空 */
.site-ring {
  fill: none;
  stroke-width: 1.6;
}
.node.station .site-ring { stroke: var(--c-station); }
.node.plant .site-ring { stroke: var(--c-plant); }
.node.converter .site-ring { stroke: var(--c-conv); }
.node.unit .site-ring { stroke: var(--c-unit); }
.node.load .site-ring { stroke: var(--c-load); }
.node.trafo .site-ring { stroke: var(--c-trafo); }

/* 密集图幅里的文字：加一圈底色描边，压到相邻符号/文字时仍然读得清 */
.node .nm,
.node .kv,
.node .kv-u,
.node .unit-nm,
.node .unit-mw,
.br-no,
.note-l,
.note-h,
.legend-h,
.legend-l,
.float-t,
.float-v,
.scale-t {
  paint-order: stroke fill;
  stroke: #071624;
  stroke-width: 2.8px;
  stroke-linejoin: round;
}

/* ---- 节点 ---- */
.node {
  cursor: pointer;
}
.node.dim {
  opacity: 0.55;
}
.node .halo {
  fill: none;
  stroke: var(--sig-ice);
  stroke-width: 1;
  opacity: 0.45;
}
.node .nm {
  font-size: 11.5px;
  fill: var(--p2);
  text-anchor: middle;
  transition: fill 0.15s;
}
.node .kv {
  font-size: 10px;
  fill: var(--p3);
  text-anchor: middle;
  font-family: var(--font-mono);
}
.node .kv-u {
  font-size: 7.5px;
  fill: var(--p4);
}
.node .unit-nm {
  font-size: 10px;
  fill: var(--p3);
}
.node .unit-mw {
  font-size: 9px;
  fill: var(--p4);
  font-family: var(--font-mono);
  opacity: 0;
  transition: opacity 0.15s;
}
.node:hover .unit-mw,
.node.on .unit-mw {
  opacity: 1;
}
.node.load .nm,
.node.trafo .nm {
  text-anchor: start;
}
/* 带圆框的站点：名称挂到圆框右侧，避免与上下相邻的圆框/文字相撞 */
.node .nm.site-nm {
  text-anchor: start;
}
.node:hover .nm {
  fill: var(--p1);
}
.node.on .nm {
  font-weight: 700;
}

/* ---- 按设备类型上色：符号 + 名称，与图例同色 ---- */
.node.station .nm { fill: var(--c-station); }
.node.plant .nm { fill: var(--c-plant); }
.node.converter .nm { fill: var(--c-conv); }
.node.unit .unit-nm { fill: var(--c-unit); }
.node.load .nm { fill: var(--c-load); }
.node.trafo .nm { fill: var(--c-trafo); }
.node.grid .nm { fill: var(--c-grid); }

.node.station .glyph { stroke: var(--c-station); }
.node.plant .glyph { stroke: var(--c-plant); }
.node.converter .glyph { stroke: var(--c-conv); }
.node.unit .glyph { stroke: var(--c-unit); }
.node.load .glyph { stroke: var(--c-load); }
.node.trafo .glyph { stroke: var(--c-trafo); }
.node.grid .glyph { stroke: var(--c-grid); }

/* ---- 引出标注 ---- */
.leader path {
  fill: none;
  stroke: var(--sig-ice);
  stroke-width: 1;
  opacity: 0.9;
}
.anchor {
  fill: var(--sig-ice);
}
.anno-box {
  fill: var(--float-bg);
  stroke: var(--rule-strong);
  rx: 6;
}
.anno-accent {
  fill: none;
  stroke: var(--sig);
  stroke-width: 2.2;
  stroke-linecap: round;
  opacity: 0.85;
}
.anno-h {
  font-size: 14px;
  fill: var(--p1);
  font-weight: 600;
}
.anno-h.num {
  font-family: var(--font-mono);
}
.anno-rule {
  stroke: var(--rule);
  stroke-width: 1;
}
.anno-l {
  font-size: 11px;
  fill: var(--p3);
  font-family: var(--font-mono);
  letter-spacing: 0.3px;
}
.anno-n {
  font-size: 15px;
  fill: var(--p1);
  font-family: var(--font-mono);
}
.anno-dot {
  fill: var(--sig);
}
.anno-state {
  font-size: 11px;
  fill: var(--sig-ice);
  font-family: var(--font-mono);
}

/* ---- 浮标 / 注记 ---- */
.float rect {
  fill: var(--float-bg);
  stroke: var(--rule-strong);
}
.float-t {
  font-size: 10px;
  fill: var(--p1);
}
.float-v {
  font-size: 8.5px;
  fill: var(--p2);
  font-family: var(--font-mono);
}
.scalebar line {
  stroke: var(--p2);
  stroke-width: 2.4;
  stroke-linecap: square;
}
.scale-t {
  font-size: 12px;
  fill: var(--p2);
  font-family: var(--font-mono);
}
.scale-t.mid {
  font-size: 10.5px;
  fill: var(--p3);
}
.note-h {
  font-size: 10.5px;
  fill: var(--p3);
  letter-spacing: 1px;
}
.legend-h {
  font-size: 11px;
  fill: var(--p3);
  letter-spacing: 1.2px;
}
.legend-l {
  font-size: 11px;
  font-weight: 500;
}
.legend-sep {
  stroke: rgba(95, 224, 255, 0.3);
  stroke-width: 1;
}
.note-l {
  font-size: 10px;
  fill: var(--p3);
}
.note-l.dim {
  fill: var(--p4);
}
/* 图内图例底板：不透明，压住的网格与连线一律不显示 */
.note-patch {
  fill: #06121f;
  stroke: rgba(95, 224, 255, 0.22);
}

/* ---- 说明块（HTML 覆盖层，字号可调大、内容可滚动） ---- */
.notes-fo {
  overflow: visible;
  animation: fadeOutNotes 1s ease 6s forwards;
}
@keyframes fadeOutNotes {
  to {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }
}
.sheet-notes {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px 12px 8px;
  border: 1px solid rgba(95, 224, 255, 0.24);
  border-radius: 4px;
  background: linear-gradient(180deg, #0a1a2b 0%, #06121f 100%);
  box-shadow: inset 0 1px 0 rgba(95, 224, 255, 0.12), 0 6px 18px rgba(0, 0, 0, 0.45);
  color: var(--p3);
  font-family: var(--font-body);
  overflow: hidden;
}
.notes-head {
  display: flex;
  align-items: center;
  gap: 7px;
  flex: none;
  padding-bottom: 6px;
  margin-bottom: 5px;
  border-bottom: 1px solid rgba(95, 224, 255, 0.16);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 1.2px;
  color: var(--p1);
}
.notes-tick {
  width: 3px;
  height: 11px;
  border-radius: 1px;
  background: var(--sig);
  box-shadow: 0 0 6px rgba(95, 224, 255, 0.7);
  flex: none;
}
.notes-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(95, 224, 255, 0.35) transparent;
}
.notes-body::-webkit-scrollbar {
  width: 4px;
}
.notes-body::-webkit-scrollbar-thumb {
  background: rgba(95, 224, 255, 0.32);
  border-radius: 2px;
}
.notes-body::-webkit-scrollbar-track {
  background: transparent;
}
.notes-body p {
  margin: 0 0 4px;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--p2);
  display: flex;
  gap: 6px;
}
.notes-body p:last-child {
  margin-bottom: 0;
}
.notes-body p.dim {
  color: var(--p4);
}
.notes-body b {
  flex: none;
  width: 9px;
  color: var(--sig-ice);
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 600;
  line-height: 1.7;
  opacity: 0.75;
}

/* ---- 图签 ---- */
.tb {
  position: absolute;
  right: 12px;
  bottom: 10px;
  width: 366px;
  border: 1px solid var(--rule-strong);
  border-radius: 3px;
  background: var(--float-bg);
  font-size: 11px;
  pointer-events: none;
  overflow: hidden;
}
.tb-row {
  display: flex;
}
.tb-row + .tb-row {
  border-top: 1px solid var(--rule);
}
.tb-cell {
  display: flex;
  align-items: baseline;
  gap: 5px;
  padding: 4px 8px;
  flex: 1;
  min-width: 0;
}
.tb-cell + .tb-cell {
  border-left: 1px solid var(--rule);
}
.tb-cell.wide {
  flex: 2.4;
}
.tb .k {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.8px;
  color: var(--p4);
  flex: none;
}
.tb .v {
  color: var(--p2);
  font-size: 10.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tb .v.num {
  font-family: var(--font-mono);
}
.anno-close {
  font-size: 14px;
  fill: var(--p4);
  cursor: pointer;
  transition: fill 0.15s;
}
.anno-close:hover {
  fill: #ff5e5e;
}
.layers {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: none;
}
.layer {
  white-space: nowrap;
  padding: 4px 12px;
  font-size: 11px;
  color: var(--p3);
  background: transparent;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}
.layer:hover {
  color: var(--sig-ice);
  background: rgba(95, 224, 255, 0.08);
}
.layer.pending {
  color: var(--p4);
}
.layer.on {
  color: var(--sig-ice);
  background: var(--sig-dim);
  font-weight: 500;
}
</style>
