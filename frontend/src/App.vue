<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue"
import { useDashboardStore } from "./stores/dashboard"
import AppHeader from "./components/AppHeader.vue"
import ConfigPanel from "./components/ConfigPanel.vue"
import TopologyPanel from "./components/TopologyPanel.vue"
import WaveformPanel from "./components/WaveformPanel.vue"
import NodeStatusPanel from "./components/NodeStatusPanel.vue"
import ScenarioPanel from "./components/ScenarioPanel.vue"
import TaskPanel from "./components/TaskPanel.vue"

// 页面一加载，立刻去后端拉真实数据


const store = useDashboardStore()
let taskTimer: number | undefined

onMounted(() => {
  store.fetchRealData()
})

function fitScreen() {
  const el = document.querySelector<HTMLElement>(".screen")
  if (!el) return
  const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
  el.style.transform = `scale(${scale})`
}

onMounted(() => {
  fitScreen()
  window.addEventListener("resize", fitScreen)
  taskTimer = window.setInterval(() => store.tickTasks(), 2500)
})
onBeforeUnmount(() => {
  window.removeEventListener("resize", fitScreen)
  window.clearInterval(taskTimer)
})
</script>

<template>
  <div class="screen-scaler">
    <div class="screen">
      <div class="bg-grid-floor" aria-hidden="true"></div>
      <AppHeader />
      <main class="main-grid">
        <ConfigPanel class="col-left" />
        <TopologyPanel class="col-center" />
        <div class="col-right">
          <WaveformPanel class="half" />
          <NodeStatusPanel class="half" />
        </div>
      </main>
      <footer class="bottom-grid">
        <ScenarioPanel class="bottom-left" />
        <TaskPanel class="bottom-right" />
      </footer>
    </div>
  </div>
</template>

<style scoped>
.main-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 385px 1fr 500px;
  gap: var(--gap);
}
.col-left, .col-center { min-height: 0; }
.col-right {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}
.half { flex: 1; min-height: 0; }

.bottom-grid {
  flex: none;
  height: 250px;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: var(--gap);
}
.bottom-left, .bottom-right { min-height: 0; }
</style>