<script setup lang="ts">
import { computed, ref } from 'vue'
import { tasks } from '../data/model'

const rows = computed(() => [...tasks, ...tasks.map((t, i) => ({ ...t, id: t.id.replace(/\d{3}$/, String(6 + i).padStart(3, '0')), time: '13:5' + i + ':10' }))])
const filter = ref<'all' | 'running' | 'done' | 'queued'>('all')
const list = computed(() => (filter.value === 'all' ? rows.value : rows.value.filter((r) => r.state === filter.value)))
</script>

<template>
  <div class="view">
    <section class="card">
      <header class="head">
        <div>
          <h2>仿真任务</h2>
          <p class="meta">共 {{ rows.length }} 条 · 可按状态筛选，点击行查看波形与节点读数</p>
        </div>
        <div class="tabs">
          <button class="tab" :class="{ on: filter === 'all' }" @click="filter = 'all'">全部</button>
          <button class="tab" :class="{ on: filter === 'running' }" @click="filter = 'running'">运行中</button>
          <button class="tab" :class="{ on: filter === 'queued' }" @click="filter = 'queued'">排队</button>
          <button class="tab" :class="{ on: filter === 'done' }" @click="filter = 'done'">已完成</button>
        </div>
      </header>

      <table>
        <thead>
          <tr>
            <th>任务</th>
            <th>类型</th>
            <th>引擎</th>
            <th class="w">进度</th>
            <th>状态</th>
            <th class="right">创建时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in list" :key="t.id">
            <td class="id num">{{ t.id }}</td>
            <td>{{ t.kind }}</td>
            <td class="muted">{{ t.engine }}</td>
            <td>
              <div class="prog">
                <span class="bar" :class="{ hot: t.state === 'queued' }"><i :style="{ width: t.progress + '%' }" /></span>
                <span class="pct num">{{ t.progress }}%</span>
              </div>
            </td>
            <td>
              <span class="st" :class="t.state">
                <i class="dot" :class="{ ok: t.state === 'done', run: t.state === 'running', warn: t.state === 'queued' }" />
                {{ t.state === 'done' ? '已完成' : t.state === 'running' ? '运行中' : '排队中' }}
              </span>
            </td>
            <td class="right num muted">{{ t.time }}</td>
          </tr>
        </tbody>
      </table>

      <footer class="foot">
        <span class="label">{{ list.length }} 条记录</span>
        <span class="pager">
          <button class="btn ghost">←</button>
          <button class="btn ghost">→</button>
        </span>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.view { padding: 18px 24px 24px; }
.card { padding: 16px 18px 8px; }
.head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 10px; }
.head h2 { margin: 0 0 3px; font-size: 16px; font-weight: 600; }
.meta { margin: 0; font-size: 11.5px; color: var(--t3); }

table { width: 100%; border-collapse: collapse; }
th {
  text-align: left;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--t3);
  font-weight: 500;
  padding: 8px 10px;
  border-bottom: 1px solid var(--bd);
}
th.w { width: 26%; }
td { padding: 12px 10px; border-bottom: 1px solid #f0eee7; font-size: 12.5px; }
tr:last-child td { border-bottom: 0; }
th.right, td.right { text-align: right; }
.id { font-size: 12px; }
.muted { color: var(--t3); }

.prog { display: flex; align-items: center; gap: 9px; }
.prog .bar { width: 150px; }
.pct { font-size: 11.5px; color: var(--t2); }
.st { display: inline-flex; align-items: center; gap: 6px; }
.st.done { color: var(--t2); }
.st.running { color: var(--blue); }
.st.queued { color: var(--amber); }

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 4px 6px;
  border-top: 1px solid var(--bd);
  margin-top: 6px;
}
.pager { display: flex; gap: 6px; }
</style>
