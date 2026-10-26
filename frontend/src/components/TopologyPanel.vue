<script setup lang="ts">
import { computed, ref } from "vue"
import { useDashboardStore } from "../stores/dashboard"
import GPanel from "./GPanel.vue"

const store = useDashboardStore()
const fullscreen = ref(false)

const topo = computed(() => store.currentTopology)
const selectedNode = computed(() => store.selectedNodeId)

function nodeStatusClass(s: string) {
  return s === "normal" ? "st-normal" : s === "overload" ? "st-overload" : "st-fault"
}

const ICON_SRC: Record<string, string> = {
  wind: "/icons/00-wind-turbine.png",
  pv: "/icons/01-solar-panel.png",
  substation: "/icons/03-substation.png",
  converter: "/icons/04-converter.png",
  grid: "/icons/05-transmission.png",
  industry: "/icons/07-factory.png",
  residential: "/icons/06-house-load.png",
  storage: "/icons/02-battery.png"
}

function nodeIconSrc(kind: string) {
  return ICON_SRC[kind] ?? "/icons/23-globe.png"
}

function toggleFullscreen() {
  const el = document.querySelector(".topo-panel")
  if (!el) return
  if (!document.fullscreenElement) el.requestFullscreen?.()
  else document.exitFullscreen?.()
}
</script>

<template>
  <GPanel title="拓扑图展示视图" class="topo-panel" icon-src="/icons/20-network-star.png">
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
      <svg class="topo-svg" viewBox="0 0 920 480" role="img" aria-label="电网拓扑单线图">
        <defs>
          <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- buses -->
        <g v-for="b in topo.buses" :key="b.id">
          <line :x1="b.x" :y1="b.y" :x2="b.x + b.w" :y2="b.y" class="bus-line" filter="url(#glow)" />
          <circle :cx="b.x" :cy="b.y" r="3" class="bus-dot" />
          <circle :cx="b.x + b.w" :cy="b.y" r="3" class="bus-dot" />
          <text :x="b.x + b.w / 2" :y="b.y - 6" class="bus-label">{{ b.name }}</text>
        </g>

        <!-- edges -->
        <g v-for="e in topo.edges" :key="e.id">
          <polyline :points="e.points.map(p => p.join(',')).join(' ')" class="edge" :class="{ alert: e.alert }" />
          <polyline v-if="!e.alert" :points="e.points.map(p => p.join(',')).join(' ')" class="edge-flow" />
          <polyline v-else :points="e.points.map(p => p.join(',')).join(' ')" class="edge-flow alert" />
        </g>

        <!-- nodes -->
        <g v-for="n in topo.nodes" :key="n.id" class="node" :class="[nodeStatusClass(n.status), { selected: n.id === selectedNode }]" @click="store.selectNode(n.id)" tabindex="0" role="button" :aria-label="n.name" @keydown.enter="store.selectNode(n.id)">
          <circle :cx="n.x" :cy="n.y" r="30" class="node-halo" />
          <circle :cx="n.x" :cy="n.y" r="26" class="node-ring" />
          <image :href="nodeIconSrc(n.kind)" :x="n.x - 15" :y="n.y - 15" width="30" height="30" preserveAspectRatio="xMidYMid meet" class="node-icon-img" />
          <path v-if="n.status !== 'normal'" :d="`M${n.x + 14} ${n.y - 24} l6 10 h-12 z`" class="warn-tri" />
          <text :x="n.x" :y="n.y + 44" class="node-name">{{ n.name }}</text>
          <text :x="n.x" :y="n.y + 58" class="node-sub">{{ n.sub }}</text>
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
.node .node-name { fill: var(--text-primary); font-size: 13px; font-weight: 600; text-anchor: middle; }
.node .node-sub { fill: var(--text-secondary); font-size: 11px; text-anchor: middle; }
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