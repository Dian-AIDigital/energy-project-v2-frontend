<script setup lang="ts">
import { computed, ref, onMounted } from "vue"
import { useDashboardStore } from "../stores/dashboard"
import GPanel from "./GPanel.vue"

const store = useDashboardStore()
const fullscreen = ref(false)

const topo = computed(() => store.currentTopology)
const selectedNode = computed(() => store.selectedNodeId)

const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
let isDragging = false
let startX = 0
let startY = 0

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  zoom.value = Math.max(0.5, Math.min(zoom.value * delta, 5))
}

function onMouseDown(e: MouseEvent) {
  isDragging = true
  startX = e.clientX - panX.value
  startY = e.clientY - panY.value
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging) return
  panX.value = e.clientX - startX
  panY.value = e.clientY - startY
}

function onMouseUp() {
  isDragging = false
}

function nodeStatusClass(s: string) {
  return s === "normal" ? "st-normal" : s === "overload" ? "st-overload" : "st-fault"
}

function nodeIcon(kind: string) {
  switch (kind) {
    case "wind": return "M4 8h9a2.5 2.5 0 10-2.5-2.5M4 12h13a2.5 2.5 0 11-2.5 2.5M4 16h7a2 2 0 11-2 2M12 6.5v9"
    case "pv": return "M3 9l9-6 9 6M6 9v9h12V9M10 12h1.5v1.5H10zM14 12h1.5v1.5H14zM10 15.5h1.5V17H10zM14 15.5h1.5V17H14z"
    case "substation": return "M12 3v18M8 8h8M6 12h12M9 3l3 2 3-2M9 21l3-2 3 2M12 8l-3 4h6l-3-4z"
    case "converter": return "M5 5h14v14H5zM9 9l3 3-3 3M13 15h4"
    case "grid": return "M12 3l7 16H5zM8.5 13h7M9.8 9.5h4.4"
    case "industry": return "M3 20V10l5 3v-3l5 3V7h8v13zM7 16h2m3 0h2m3 0h2"
    case "residential": return "M4 21V11l8-7 8 7v10M9 21v-5h6v5M11 12h2"
    case "storage": return "M6 8h12a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2zM18 10h2v4h-2M8 11v2M11 11v2"
  }
}

function toggleFullscreen() {
  const el = document.querySelector(".topo-panel")
  if (!el) return
  if (!document.fullscreenElement) el.requestFullscreen?.()
  else document.exitFullscreen?.()
}
</script>

<template>
  <GPanel title="拓扑图展示视图" class="topo-panel">
    <template #icon>
      <circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="10" cy="18" r="2.5"/><path d="M8.3 7l7.3.7M7.4 8.2l1.5 7.4M16.4 10.1l-5 6.3"/>
    </template>
    <template #actions>
      <button class="hud-button secondary" @click="toggleFullscreen">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>
        允许全屏展示
      </button>
    </template>

    <div class="topo-wrap">
      <svg 
        class="topo-svg" 
        viewBox="0 0 920 480" 
        role="img" 
        aria-label="电网拓扑单线图"
        @wheel.prevent="onWheel"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
        style="cursor: grab;"
      >
        <g :transform="`translate(${panX}, ${panY}) scale(${zoom})`">
          <defs>
            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <g v-for="b in topo.buses" :key="b.id">
            <line :x1="b.x" :y1="b.y" :x2="b.x + b.w" :y2="b.y" class="bus-line" filter="url(#glow)" />
            <circle :cx="b.x" :cy="b.y" r="3" class="bus-dot" />
            <circle :cx="b.x + b.w" :cy="b.y" r="3" class="bus-dot" />
            <text :x="b.x + b.w / 2" :y="b.y - 6" class="bus-label">{{ b.name }}</text>
          </g>

          <g v-for="e in topo.edges" :key="e.id">
            <polyline :points="e.points.map(p => p.join(',')).join(' ')" class="edge" :class="{ alert: e.alert }" />
            <polyline v-if="!e.alert" :points="e.points.map(p => p.join(',')).join(' ')" class="edge-flow" />
            <polyline v-else :points="e.points.map(p => p.join(',')).join(' ')" class="edge-flow alert" />
          </g>

                    <g v-for="n in topo.nodes" :key="n.id" class="node" :class="[nodeStatusClass(n.status), { selected: n.id === selectedNode }]" @click="store.selectNode(n.id)" tabindex="0" role="button" :aria-label="n.name" @keydown.enter="store.selectNode(n.id)">
            <circle :cx="n.x" :cy="n.y" r="18" class="node-halo" />
            <circle :cx="n.x" :cy="n.y" r="14" class="node-ring" />
            <g :transform="`translate(${n.x - 10},${n.y - 10}) scale(0.8)`">
              <path :d="nodeIcon(n.kind)" class="node-icon" />
            </g>
            <path v-if="n.status !== 'normal'" :d="`M${n.x + 8} ${n.y - 14} l4 8 h-8 z`" class="warn-tri" />
            
            <text :x="n.x" :y="n.y + 28" class="node-name" style="font-size: 13px; text-anchor: middle;">{{ n.name }}</text>
            <text :x="n.x" :y="n.y + 38" class="node-sub" style="font-size: 11px; text-anchor: middle;">{{ n.sub }}</text>
          </g>
        </g>
      </svg>
      
      <div class="thumbs">
        <div class="thumbs-title">
          <svg viewBox="0 0 24 24" class="ti" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M17 14v7M13.5 17.5h7"/></svg>
          <span>拓扑图选择</span>
        </div>
        <div class="thumb-list">
          <button class="page-btn" aria-label="上一页"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M14 6l-6 6 6 6"/></svg></button>
          <button
            v-for="t in store.topologies" :key="t.id"
            class="thumb" :class="{ active: t.id === store.currentTopologyId }"
            @click="store.setTopology(t.id)"
          >
            <svg viewBox="0 0 80 56" class="mini" aria-hidden="true">
              <circle cx="12" cy="12" r="5"/><circle cx="40" cy="26" r="6"/><circle cx="66" cy="12" r="5"/><circle cx="24" cy="46" r="5"/><circle cx="58" cy="44" r="5"/>
              <path d="M14 14l22 10M44 24l20-10M27 43l10-13M52 42l-9-13" />
            </svg>
            <span>{{ t.name }}</span>
          </button>
          <button class="page-btn" aria-label="下一页"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M10 6l6 6-6 6"/></svg></button>
        </div>
      </div>
    </div>
  </GPanel>
</template>

<style scoped>
.topo-svg {
  flex: 1; 
  min-height: 0; 
  width: 100%; 
  background: rgba(2, 10, 24, 0.55); 
  border: 1px solid rgba(0, 120, 190, 0.25); 
  border-radius: 6px;
  overflow: visible hidden; 
}
.topo-wrap { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.topo-svg { flex: 1; min-height: 0; width: 100%; background: rgba(2, 10, 24, 0.55); border: 1px solid rgba(0, 120, 190, 0.25); border-radius: 6px; }

.bus-line { stroke: var(--accent-cyan); stroke-width: 3; opacity: 0.9; }
.bus-dot { fill: var(--accent-cyan); }
.bus-label { fill: var(--text-secondary); font-size: 12px; text-anchor: middle; }

.edge { fill: none; stroke: var(--accent-cyan); stroke-width: 2; opacity: 0.75; }
.edge.alert { stroke: var(--warning); }
.edge-flow { fill: none; stroke: rgba(255,255,255,0.95); stroke-width: 2; stroke-dasharray: 4 24; animation: flow-dash 1.2s linear infinite; filter: drop-shadow(0 0 3px currentColor); color: var(--accent-cyan); }
.edge-flow.alert { color: var(--warning); animation: pulse-glow 1.4s ease-in-out infinite; }

.node { cursor: pointer; }
.node .node-halo { fill: rgba(0, 216, 255, 0.07); stroke: none; }
.node.st-normal .node-ring { stroke: var(--success); }
.node.st-overload .node-ring { stroke: var(--warning); animation: pulse-glow 1.6s ease-in-out infinite; }
.node.st-fault .node-ring { stroke: var(--danger); animation: pulse-glow 1s ease-in-out infinite; }
.node .node-ring { fill: rgba(3, 16, 38, 0.9); stroke-width: 2; filter: drop-shadow(0 0 6px currentColor); }
.node.st-normal .node-ring { color: var(--success); }
.node.st-overload .node-ring { color: var(--warning); }
.node.st-fault .node-ring { color: var(--danger); }
.node .node-icon { fill: none; stroke: var(--accent-cyan); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.node .node-name { fill: var(--text-primary); font-size: 10px; font-weight: 600; text-anchor: middle; }
.node .node-sub { fill: var(--text-secondary); font-size: 8px; text-anchor: middle; }
.node .warn-tri { fill: var(--warning); filter: drop-shadow(0 0 4px var(--warning)); animation: pulse-glow 1.4s ease-in-out infinite; }
.node.selected .node-ring { stroke-width: 3; }
.node:hover .node-ring { stroke-width: 3; }
.node:focus { outline: none; }

.thumbs { flex: none; display: flex; flex-direction: column; gap: 6px; padding-top: 8px; }
.thumbs-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--text-primary); }
.thumbs-title .ti { width: 14px; height: 14px; color: var(--accent-cyan); }
.thumb-list { display: flex; align-items: stretch; gap: 8px; }
.thumb { flex: 1; display: flex; flex-direction: column; gap: 4px; align-items: center; justify-content: center; padding: 6px 4px 5px; background: rgba(3, 16, 38, 0.85); border: 1px solid rgba(0, 120, 190, 0.35); border-radius: 6px; cursor: pointer; color: var(--text-primary); font-size: 12px; font-family: inherit; transition: border-color .2s, color .2s; }
.thumb:hover { border-color: var(--accent-cyan); }
.thumb.active { border-color: var(--accent-cyan); color: var(--accent-cyan); box-shadow: 0 0 8px rgba(0,216,255,.3); }
.thumb .mini { width: 100%; max-height: 52px; stroke: currentColor; fill: none; stroke-width: 1.4; opacity: .85; }
.page-btn { width: 28px; flex: none; border-radius: 50%; border: 1px solid var(--panel-border); background: rgba(3,16,38,.9); color: var(--accent-cyan); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.page-btn svg { width: 14px; height: 14px; }
.page-btn:hover { border-color: var(--accent-cyan); }

.topo-panel:fullscreen { background: var(--bg-page); padding: 20px; }
</style>