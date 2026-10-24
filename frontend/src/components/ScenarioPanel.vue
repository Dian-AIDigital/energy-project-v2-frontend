<script setup lang="ts">
import { useDashboardStore } from "../stores/dashboard"
import GPanel from "./GPanel.vue"

const store = useDashboardStore()

function riskClass(level: number) {
  return level <= 2 ? "low" : level === 3 ? "mid" : "high"
}
function statusText(s: string) { return s === "ready" ? "已就绪" : s === "pending" ? "待运行" : "已完成" }
function statusClass(s: string) { return s === "ready" ? "success" : s === "pending" ? "neutral" : "success" }

function thumbStyle(hint: string) {
  const gradients: Record<string, string> = {
    "wind-pv-blue": "linear-gradient(135deg, #0b3e66, #12558c 45%, #37c6ff)",
    "storm-turbine": "linear-gradient(135deg, #1a2431, #33404d 60%, #8fa3b5)",
    "sunset-tower": "linear-gradient(135deg, #5b2a12, #a0522d 55%, #ff9f40)",
    "solar-farm": "linear-gradient(140deg, #103a5c, #1e90ff 55%, #9be7ff)",
    "snow-wind": "linear-gradient(135deg, #1c2b3a, #4a6274 60%, #dfeef7)",
    "control-room": "linear-gradient(135deg, #04182e, #0a2f52 50%, #00d8ff)"
  }
  return { background: gradients[hint] ?? gradients["wind-pv-blue"] }
}
</script>

<template>
  <GPanel title="场景库视图">
    <template #icon>
      <ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>
    </template>
    <div class="grid">
      <button v-for="s in store.scenarios" :key="s.id" class="card" @click="store.applyScenario(s.id)">
        <span class="thumb" :style="thumbStyle(s.imageHint)" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1.4"><path d="M3 15l6-5 4 3 5-6 3 3"/><path d="M3 20h18"/></svg>
        </span>
        <span class="info">
          <span class="name">{{ s.name }}</span>
          <span class="tags"><i v-for="t in s.tags" :key="t">{{ t }}</i></span>
          <span class="risk">
            <span class="rl">风险等级：</span>
            <span class="blocks" :class="riskClass(s.riskLevel)"><i v-for="i in 5" :key="i" :class="{ on: i <= s.riskLevel }"></i></span>
          </span>
          <span class="status" :class="statusClass(s.status)">
            <svg v-if="s.status !== 'pending'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
            {{ statusText(s.status) }}
          </span>
        </span>
      </button>
    </div>
  </GPanel>
</template>

<style scoped>
.grid { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr); gap: 10px; }
.card { display: flex; gap: 10px; padding: 8px; background: rgba(3, 16, 38, 0.6); border: 1px solid rgba(0, 120, 190, 0.35); border-radius: 6px; cursor: pointer; text-align: left; font-family: inherit; color: inherit; transition: border-color .2s, transform .15s; }
.card:hover { border-color: var(--accent-cyan); transform: translateY(-1px); }
.thumb { width: 108px; flex: none; border-radius: 5px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.thumb svg { width: 46px; height: 46px; opacity: .85; }
.info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; justify-content: center; }
.name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
.tags { display: flex; gap: 5px; flex-wrap: wrap; }
.tags i { font-style: normal; font-size: 11px; padding: 1px 7px; border: 1px solid rgba(0, 180, 255, .45); border-radius: 9px; color: var(--accent-cyan); background: rgba(0, 60, 110, .35); }
.risk { display: flex; align-items: center; gap: 5px; }
.rl { font-size: 11px; color: var(--text-secondary); }
.blocks { display: inline-flex; gap: 3px; }
.blocks i { width: 11px; height: 7px; border-radius: 2px; background: rgba(0, 60, 110, .6); }
.blocks.low i.on { background: var(--success); box-shadow: 0 0 4px var(--success); }
.blocks.mid i.on { background: var(--warning); box-shadow: 0 0 4px var(--warning); }
.blocks.high i.on { background: var(--danger); box-shadow: 0 0 4px var(--danger); }
.status { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; }
.status.success { color: var(--success); }
.status.neutral { color: var(--text-secondary); }
.status svg { width: 14px; height: 14px; }
</style>