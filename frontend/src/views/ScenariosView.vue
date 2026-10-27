<script setup lang="ts">
import { computed, ref } from 'vue'
import { scenarios, tasks } from '../data/model'

const filter = ref<'all' | 'ready' | 'pending'>('all')
const list = computed(() =>
  scenarios.filter((s) => (filter.value === 'all' ? true : s.state === filter.value)),
)
const riskText = ['低', '中', '较高', '高']
</script>

<template>
  <div class="view">
    <section class="card">
      <header class="head">
        <div>
          <h2>场景库</h2>
          <p class="meta">6 个场景 · 由聚类工况与拓扑组合生成，可直接提交仿真</p>
        </div>
        <div class="tabs">
          <button class="tab" :class="{ on: filter === 'all' }" @click="filter = 'all'">全部 <em>6</em></button>
          <button class="tab" :class="{ on: filter === 'ready' }" @click="filter = 'ready'">已就绪 <em>2</em></button>
          <button class="tab" :class="{ on: filter === 'pending' }" @click="filter = 'pending'">待运行 <em>4</em></button>
        </div>
      </header>

      <table>
        <thead>
          <tr>
            <th>场景</th>
            <th>能源组合</th>
            <th>风险等级</th>
            <th>关联任务</th>
            <th>状态</th>
            <th class="right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in list" :key="s.id">
            <td>
              <div class="cell">
                <span class="cover" />
                <div>
                  <b>{{ s.name }}</b>
                  <em>SCN-{{ String(i + 1).padStart(3, '0') }} · 多源互联电网</em>
                </div>
              </div>
            </td>
            <td class="muted">光伏 · 风电 · 负荷</td>
            <td>
              <span class="risk" :class="`r${s.risk}`">
                <i v-for="n in 4" :key="n" :class="{ f: n <= s.risk }" />{{ riskText[s.risk - 1] }}
              </span>
            </td>
            <td class="num muted">{{ tasks[i % tasks.length].id.slice(-3) }}</td>
            <td>
              <span class="st" :class="s.state">
                <i class="dot" :class="{ ok: s.state === 'ready' || s.state === 'done', warn: s.state === 'pending' }" />
                {{ s.state === 'ready' ? '已就绪' : s.state === 'pending' ? '待运行' : '已完成' }}
              </span>
            </td>
            <td class="right"><button class="btn">提交</button></td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.view { padding: 18px 24px 24px; }
.card { padding: 16px 18px 6px; }
.head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 10px; }
.head h2 { margin: 0 0 3px; font-size: 16px; font-weight: 600; }
.meta { margin: 0; font-size: 11.5px; color: var(--t3); }
.tab em { font-style: normal; color: var(--t4); margin-left: 4px; font-size: 11px; }

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
td { padding: 12px 10px; border-bottom: 1px solid #f0eee7; vertical-align: middle; }
tr:last-child td { border-bottom: 0; }
th.right, td.right { text-align: right; }
.muted { color: var(--t3); font-size: 12px; }

.cell { display: flex; align-items: center; gap: 10px; }
.cover {
  width: 34px;
  height: 26px;
  border-radius: 5px;
  background: linear-gradient(135deg, #dfe7e2, #cfd9d3);
  border: 1px solid var(--bd);
  flex: none;
}
.cell b { display: block; font-size: 12.5px; font-weight: 600; }
.cell em { font-style: normal; font-size: 10.5px; color: var(--t4); }

.risk { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; color: var(--t2); }
.risk i { width: 3px; height: 10px; border-radius: 1px; background: #e6e3da; }
.risk.r1 i.f, .risk.r2 i.f { background: var(--green); }
.risk.r3 i.f { background: var(--amber); }
.risk.r4 i.f { background: var(--red); }

.st { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--t2); }
.st.pending { color: var(--amber); }
</style>
