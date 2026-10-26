<script setup lang="ts">
import { useDashboardStore } from "../stores/dashboard"
import GPanel from "./GPanel.vue"

const store = useDashboardStore()

function statusInfo(s: string) {
  if (s === "done") return { text: "完成", cls: "success", icon: "M8 12.5l3 3 5-6" }
  if (s === "running") return { text: "运行中", cls: "info", icon: "M13 2L4 14h6l-1 8 9-12h-6l1-8z" }
  return { text: "排队中", cls: "warning", icon: "M6 3h12M7 3c0 6 10 6 10 12a5 5 0 01-10 0" }
}
</script>

<template>
  <GPanel title="仿真任务运行表" icon-src="/icons/22-org-tree.png">
    <template #icon>
      <rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>
    </template>
    <div class="table-wrap">
      <table class="hud-table tasks">
        <thead>
          <tr><th>Task_ID</th><th>任务类型</th><th>引擎</th><th>进度</th><th>状态</th><th>创建时间</th></tr>
        </thead>
        <tbody>
          <tr v-for="t in store.tasks" :key="t.id">
            <td class="num">{{ t.id }}</td>
            <td>{{ t.type }}</td>
            <td>{{ t.engine }}</td>
            <td>
              <div class="progress-cell">
                <span class="progress" :class="{ complete: t.status === 'done' }"><span class="fill" :style="{ '--p': t.progress + '%' }"></span></span>
                <span class="pv mono">{{ t.progress }}%</span>
              </div>
            </td>
            <td><span class="chip" :class="statusInfo(t.status).cls"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path :d="statusInfo(t.status).icon"/></svg>{{ statusInfo(t.status).text }}</span></td>
            <td class="num">{{ t.createdAt }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </GPanel>
</template>

<style scoped>
.table-wrap { flex: 1; overflow-y: auto; }
.tasks td { padding-top: 10px; padding-bottom: 10px; }
.progress-cell { display: flex; align-items: center; gap: 8px; }
.progress-cell .progress { flex: 1; min-width: 70px; }
.pv { font-size: 12px; color: var(--text-secondary); width: 34px; text-align: right; }
.chip svg { width: 12px; height: 12px; }
</style>