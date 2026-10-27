<script setup lang="ts">
import { computed } from "vue"
import { useDashboardStore } from "../stores/dashboard"
import GPanel from "./GPanel.vue"

const store = useDashboardStore()
const selected = computed(() => store.selectedNode)

function statusText(s: string) { return s === "normal" ? "正常" : s === "overload" ? "越限" : "故障" }
function statusClass(s: string) { return s === "normal" ? "success" : s === "overload" ? "warning" : "danger" }

const powerBars = computed(() => {
  if (!selected.value) return []
  const p = selected.value.powerMw
  return [
    { label: "0.0", v: 0 },
    { label: "0.0", v: 0 },
    { label: String(Math.abs(p) || 5), v: Math.abs(p) || 5 }
  ]
})
</script>

<template>
  <GPanel title="拓扑节点状态信息" icon-src="/icons/13-bar-chart.png">
    <template #icon>
      <path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5M9 13h6M9 17h4"/>
    </template>
    <div class="wrap">
      <div class="table-wrap">
        <table class="hud-table">
          <thead>
            <tr><th>节点名称</th><th>电压(kV)</th><th>电流(A)</th><th>功率(MW)</th><th>状态</th></tr>
          </thead>
          <tbody>
            <tr
              v-for="m in store.measurements" :key="m.nodeId"
              :class="{ 'row-warning': m.status !== 'normal', active: m.nodeId === store.selectedNodeId }"
              @click="store.selectNode(m.nodeId)"
            >
              <td>{{ m.name }}</td>
              <td class="num">{{ m.voltageKv.toFixed(2) }}</td>
              <td class="num">{{ m.currentA }}</td>
              <td class="num">{{ m.powerMw.toFixed(1) }}</td>
              <td><span class="st"><i class="dot" :class="statusClass(m.status)"></i>{{ statusText(m.status) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <aside v-if="selected" class="detail">
        <div class="detail-title">{{ selected.name }}节点信息</div>
        <dl>
          <div><dt>电压</dt><dd class="mono">{{ selected.voltageKv.toFixed(1) }} kV</dd></div>
          <div><dt>电流</dt><dd class="mono">{{ selected.currentA }} A</dd></div>
          <div><dt>功率</dt><dd class="mono">{{ selected.powerMw.toFixed(1) }} MW</dd></div>
          <div><dt>状态</dt><dd><span class="chip" :class="statusClass(selected.status)"><svg v-if="selected.status!=='normal'" viewBox="0 0 24 24" class="wi" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3L2 21h20zM12 10v5M12 18v.5"/></svg>{{ statusText(selected.status) }}</span></dd></div>
        </dl>
        <div class="pc-title">功率构成(MW)</div>
        <div class="bars">
          <div v-for="(b, i) in powerBars" :key="i" class="bar-col">
            <div class="bar" :style="{ height: Math.min(60, b.v * 8) + 'px', '--bc': ['var(--accent-cyan)', 'var(--chart-orange)', 'var(--success)'][i] }"></div>
            <span class="bar-val mono">{{ b.label }}</span>
          </div>
        </div>
      </aside>
    </div>
  </GPanel>
</template>

<style scoped>
.wrap { flex: 1; min-height: 0; display: flex; gap: 10px; }
.table-wrap { flex: 1; min-width: 0; overflow-y: auto; }
tr.active { outline: 1px solid rgba(0,216,255,.45); outline-offset: -1px; }
.st { display: inline-flex; align-items: center; gap: 6px; }

.detail { width: 132px; flex: none; display: flex; flex-direction: column; gap: 7px; background: rgba(3, 16, 38, 0.7); border: 1px solid rgba(0, 120, 190, 0.4); border-radius: 6px; padding: 10px; }
.detail-title { font-size: 13px; font-weight: 700; color: var(--accent-cyan); }
dl { margin: 0; display: flex; flex-direction: column; gap: 5px; }
dl div { display: flex; justify-content: space-between; align-items: center; }
dt { color: var(--text-secondary); font-size: 12px; }
dd { margin: 0; font-size: 12px; }
.chip { height: 18px; font-size: 11px; padding: 0 7px; }
.wi { width: 11px; height: 11px; }
.pc-title { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
.bars { display: flex; gap: 8px; align-items: flex-end; height: 78px; padding-top: 4px; }
.bar-col { display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 1; }
.bar { width: 12px; background: var(--bc); border-radius: 2px 2px 0 0; box-shadow: 0 0 6px var(--bc); min-height: 2px; }
.bar-val { font-size: 10px; color: var(--text-secondary); }
</style>