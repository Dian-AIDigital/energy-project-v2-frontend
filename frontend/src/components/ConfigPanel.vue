<script setup lang="ts">
import { computed } from "vue"
import { useDashboardStore } from "../stores/dashboard"
import GPanel from "./GPanel.vue"

const store = useDashboardStore()

const sliders = computed(() => [
  { key: "pvOutput", label: "光伏出力", icon: "sun", value: store.params.pvOutput },
  { key: "windOutput", label: "风电出力", icon: "wind", value: store.params.windOutput },
  { key: "load", label: "负荷", icon: "load", value: store.params.load },
  { key: "soc", label: "储能SOC", icon: "battery", value: store.params.soc }
] as const)

function setParam(key: string, value: number) {
  ;(store.params as Record<string, number>)[key] = value
}

function iconPath(name: string) {
  switch (name) {
    case "sun": return "M12 3v2m0 14v2M5.6 5.6l1.4 1.4m10 10l1.4 1.4M3 12h2m14 0h2M5.6 18.4L7 17m10-10l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z"
    case "wind": return "M4 8h9a2.5 2.5 0 10-2.5-2.5M4 12h13a2.5 2.5 0 11-2.5 2.5M4 16h7a2 2 0 11-2 2"
    case "load": return "M4 21V8l8-5 8 5v13M9 21v-6h6v6"
    case "battery": return "M7 7h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2zM17 11h2v2h-2M10 10v4"
  }
}
</script>

<template>
  <GPanel title="用户配置参数面板" icon-src="/icons/15-gear.png">
    <template #icon>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10l2.1 2.1M4.9 19.1L7 17m10-10l2.1-2.1" />
    </template>

    <div class="config-body">
      <div class="group">
        <div class="group-title">
          <svg viewBox="0 0 24 24" class="gi" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 6h10M6.8 7.5L11 16.2M17.2 7.5L13 16.2"/></svg>
          <span>拓扑选择</span>
        </div>
        <select class="hud-select" :value="store.currentTopologyId" @change="store.setTopology(($event.target as HTMLSelectElement).value)" aria-label="拓扑选择">
          <option v-for="t in store.topologies" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
      </div>

      <div class="group">
        <div class="group-title">
          <svg viewBox="0 0 24 24" class="gi" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>
          <span>源荷储参数</span>
        </div>
        <div v-for="s in sliders" :key="s.key" class="hud-slider">
          <svg class="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path :d="iconPath(s.icon)" /></svg>
          <span class="param-name">{{ s.label }}</span>
          <input
            type="range" min="0" max="100" step="1" :value="s.value"
            :style="{ '--fill': s.value + '%' }"
            :aria-label="s.label"
            @input="setParam(s.key, Number(($event.target as HTMLInputElement).value))"
          />
          <input class="hud-input value-box" type="number" min="0" max="100" :value="s.value" :aria-label="s.label + '数值'" @change="setParam(s.key, Math.max(0, Math.min(100, Number(($event.target as HTMLInputElement).value) || 0)))" />
          <span class="unit">%</span>
        </div>
      </div>

      <div class="group">
        <div class="group-title warn">
          <svg viewBox="0 0 24 24" class="gi" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3L2 21h20L12 3z"/><path d="M12 10v5M12 18v.5"/></svg>
          <span>故障设置</span>
        </div>
        <div class="field-row">
          <label class="field-label" for="fault-type">故障类型</label>
          <select id="fault-type" class="hud-select" :disabled="!store.fault.enabled" v-model="store.fault.type">
            <option>线路故障</option><option>设备故障</option><option>暂态扰动</option>
          </select>
        </div>
        <div class="field-row">
          <label class="field-label" for="fault-loc">故障位置</label>
          <select id="fault-loc" class="hud-select" :disabled="!store.fault.enabled" v-model="store.fault.location">
            <option>10kV母线1</option><option>10kV母线2</option><option>35kV母线</option><option>110kV线路</option>
          </select>
        </div>
        <div class="field-row">
          <label class="field-label" for="fault-en">是否启用</label>
          <span class="hud-switch">
            <input id="fault-en" type="checkbox" v-model="store.fault.enabled" />
            <span class="track"></span><span class="thumb"></span>
          </span>
        </div>
      </div>

      <div class="group">
        <div class="group-title">
          <svg viewBox="0 0 24 24" class="gi" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5M9 13h6M9 17h4"/></svg>
          <span>工况选择</span>
        </div>
        <div class="field-row">
          <label class="field-label" for="cond">仿真工况</label>
          <select id="cond" class="hud-select" v-model="store.condition">
            <option>典型日场景</option><option>极端天气</option><option>故障恢复</option><option>高比例新能源</option><option>冬季低温</option><option>多源协同</option>
          </select>
        </div>
      </div>

      <div class="submit-wrap">
        <button class="hud-button submit" @click="store.submitTask()" aria-label="提交仿真任务">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          提交仿真任务
        </button>
      </div>
    </div>
  </GPanel>
</template>

<style scoped>
.config-body { flex: 1; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; padding-right: 2px; }
.group { display: flex; flex-direction: column; gap: 9px; }
.group-title { display: flex; align-items: center; gap: 7px; font-size: 15px; font-weight: 700; color: var(--text-primary); }
.group-title .gi { width: 17px; height: 17px; color: var(--accent-cyan); filter: drop-shadow(0 0 5px rgba(0,216,255,.7)); }
.group-title.warn .gi { color: var(--warning); filter: drop-shadow(0 0 5px rgba(255,169,64,.7)); }
.field-row { display: flex; align-items: center; gap: 10px; }
.field-row .field-label { width: 62px; flex: none; }
.hud-slider { display: flex; align-items: center; gap: 8px; }
.hud-slider .si { width: 16px; height: 16px; color: var(--accent-cyan); flex: none; filter: drop-shadow(0 0 4px rgba(0,216,255,.6)); }
.param-name { width: 62px; flex: none; font-size: 14px; }
.value-box { height: 30px; padding: 0 6px; text-align: right; font-family: var(--font-mono); }
.unit { color: var(--text-secondary); font-size: 12px; flex: none; }
.submit-wrap { margin-top: auto; padding-top: 8px; display: flex; justify-content: center; border-top: 1px solid rgba(0,216,255,.12); }
.submit { width: 85%; }
</style>