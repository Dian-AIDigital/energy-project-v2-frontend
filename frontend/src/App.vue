<script setup lang="ts">
import { computed, ref } from 'vue'
import SideNav from './components/SideNav.vue'
import TopBar from './components/TopBar.vue'
import OverviewView from './views/OverviewView.vue'
import TopologyView from './views/TopologyView.vue'
import ConfigView from './views/ConfigView.vue'
import ScenariosView from './views/ScenariosView.vue'
import TasksView from './views/TasksView.vue'

const q = new URLSearchParams(location.search)
const tab = ref(q.get('tab') ?? 'overview')

const titles: Record<string, { title: string; sub: string; badge?: string }> = {
  overview: { title: '运行概览', sub: '数据同步于 24 秒前', badge: '2026-10-23' },
  topology: { title: '拓扑视图', sub: '实时状态 · t = 3.00 s', badge: '9 母线' },
  config: { title: '参数配置', sub: '未提交的草稿' },
  scenarios: { title: '场景库', sub: '共 6 个场景', badge: '已就绪 2' },
  tasks: { title: '仿真任务', sub: '运行中 2 · 排队 1' },
  settings: { title: '引擎与设置', sub: 'MATLAB 引擎在线' },
}
const head = computed(() => titles[tab.value] ?? titles.overview)
</script>

<template>
  <div class="shell">
    <SideNav :tab="tab" @go="tab = $event" />

    <main class="main">
      <TopBar :title="head.title" :sub="head.sub" :badge="head.badge" />

      <div class="scroll">
        <OverviewView v-if="tab === 'overview'" @go="tab = $event" />
        <TopologyView v-else-if="tab === 'topology'" />
        <ConfigView v-else-if="tab === 'config'" />
        <ScenariosView v-else-if="tab === 'scenarios'" />
        <TasksView v-else-if="tab === 'tasks'" />
        <section v-else class="placeholder card">
          <h2>引擎与设置</h2>
          <p>MATLAB 引擎：在线 · 队列 2 / 8 · 默认求解器 fsolve + ode15s。</p>
          <p>此项在接入真实后端后开放：连接串、超时、并发上限。</p>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.shell { display: flex; height: 100%; background: var(--bg); }
.main { flex: 1; min-width: 0; display: flex; flex-direction: column; height: 100%; }
.scroll { flex: 1; min-height: 0; overflow-y: auto; }
.placeholder { margin: 18px 24px; padding: 20px; }
.placeholder h2 { margin: 0 0 8px; font-size: 16px; }
.placeholder p { margin: 0 0 6px; font-size: 12.5px; color: var(--t2); }
</style>
