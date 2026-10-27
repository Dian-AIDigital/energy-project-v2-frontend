<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import SheetStage from './components/SheetStage.vue'
import ConsoleRack from './components/ConsoleRack.vue'
import NodeDossier from './components/NodeDossier.vue'
import RecordStrip from './components/RecordStrip.vue'
import { buses, scenarios } from './data/model'

const q = new URLSearchParams(location.search)
const THEMES = ['blue', 'graphite', 'sepia', 'paper']
if (import.meta.env.SSR === false) {
  /* 主题：?theme=graphite|sepia|paper，默认蓝黑 */
  const theme = THEMES.includes(q.get('theme') ?? '') ? (q.get('theme') as string) : 'paper'
  document.body.classList.add('theme-' + theme)
}
const sel = ref(Number(q.get('sel') ?? 3) || 3)
const scene = ref(q.get('scenario') ?? 'typical')

const clock = ref('')
let timer = 0
function tick() {
  clock.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
}
onMounted(() => {
  tick()
  timer = window.setInterval(tick, 1000)
})
onUnmounted(() => window.clearInterval(timer))

const warn = computed(() => buses.find((b) => b.id === sel.value)?.read.state === 'warn')
const sceneName = computed(() => scenarios.find((s) => s.id === scene.value)?.name ?? '典型日运行')
</script>

<template>
  <div class="app">
    <header class="top">
      <div class="brand">
        <span class="mark num">NESP</span>
        <span class="name">新能源荷储技术实证平台</span>
        <span class="doc num">DWG NESP-2603</span>
      </div>
      <div class="meta">
        <span class="m"><em>时钟</em><b class="num">{{ clock }}</b></span>
        <span class="m"><em>规模</em><b>9 母线 · 9 支路</b></span>
        <span class="m"><em>工况</em><b>{{ sceneName }}</b></span>
        <span class="m status" :class="{ warn: warn }"><em>状态</em><b><i />{{ warn ? '换流阀饱和' : '运行正常' }}</b></span>
      </div>
    </header>

    <ConsoleRack :scenario="scene" @submit="() => {}" />

    <SheetStage
      :selected="sel"
      :scenario="scene"
      @select="sel = $event"
      @scenario="scene = $event"
    />

    <NodeDossier :selected="sel" @select="sel = $event" />

    <RecordStrip />
  </div>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-columns: 292px minmax(0, 1fr) 320px;
  grid-template-rows: 46px minmax(0, 1fr) 268px;
  column-gap: 14px;
  row-gap: 12px;
  grid-template-areas:
    "top top top"
    "rack stage dossier"
    "rack strip strip";
  height: 100%;
  padding: 12px 18px 14px 18px;
  row-gap: var(--s3);
  background:
    radial-gradient(1100px 460px at 18% -8%, rgba(90, 169, 255, 0.055), transparent 70%),
    var(--ink-0);
}

.top {
  grid-area: top;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border: 1px solid var(--rule);
  border-radius: var(--r-md);
  background: var(--zone-bg);
  box-shadow: var(--zone-shadow);
}

.brand { display: flex; align-items: baseline; gap: 10px; }
.mark {
  font-size: 10.5px;
  letter-spacing: 1.2px;
  color: var(--ink-1);
  background: var(--sig);
  padding: 3px 9px;
  border-radius: var(--r-pill);
}
.name { font-size: 17px; font-weight: 600; letter-spacing: 1.5px; color: var(--t1); }
.doc { font-size: 9px; color: var(--t4); letter-spacing: 1px; }

.meta { display: flex; align-items: center; gap: var(--s4); }
.m { display: inline-flex; align-items: baseline; gap: 6px; }
.m em {
  font-style: normal;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 1px;
  color: var(--t3);
}
.m b { font-weight: 400; font-size: 12.5px; color: var(--t2); white-space: nowrap; }
.m b.num { font-size: 13.5px; color: var(--t1); }
.m.status b { display: inline-flex; align-items: center; gap: 5px; color: var(--t1); }
.m.status.warn b { color: var(--alarm); }
.m.status.warn i { background: var(--alarm); box-shadow: 0 0 6px var(--alarm); }
.m.status i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--sig-ice);
  box-shadow: 0 0 6px var(--sig);
}

.app > :deep(aside.rack) { grid-area: rack; }
.app > :deep(section.stage) { grid-area: stage; }
.app > :deep(aside.dossier) { grid-area: dossier; }
.app > :deep(section.strip) { grid-area: strip; }

@media (max-width: 1700px) {
  .app {
    grid-template-columns: 256px minmax(0, 1fr) 292px;
    grid-template-rows: 38px minmax(0, 1fr) 236px;
    padding: 10px 16px 12px 16px;
  }
  .name { font-size: 14px; letter-spacing: 1px; }
  .meta { gap: 14px; }
}
@media (max-height: 960px) {
  .app {
    grid-template-rows: 36px minmax(0, 1fr) 224px;
    row-gap: 8px;
  }
  .name { font-size: 13px; }
}</style>
