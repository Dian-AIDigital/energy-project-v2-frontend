<script setup lang="ts">
import { computed } from 'vue'
import { buses } from '../data/model'

const props = defineProps<{ selected: number }>()
const cur = computed(() => buses.find((b) => b.id === props.selected) ?? buses[0])
const total = computed(() => buses.reduce((s, b) => s + b.read.p, 0))
</script>

<template>
  <aside class="dossier">
    <div class="head">
      <span class="eyebrow">节点档案 / DOSSIER</span>
      <span class="idx num">{{ String(cur.id).padStart(2, '0') }}/{{ String(buses.length).padStart(2, '0') }}</span>
    </div>

    <div class="title">
      <h2>{{ cur.name }}</h2>
      <span class="state" :class="cur.read.state">
        {{ cur.read.state === 'warn' ? '注意' : '稳态' }}
      </span>
    </div>

    <dl class="facts">
      <div><dt>电压等级</dt><dd class="num">{{ cur.kv }} kV</dd></div>
      <div><dt>母线编号</dt><dd class="num">BUS-{{ String(cur.id).padStart(2, '0') }}</dd></div>
      <div><dt>平衡方式</dt><dd>{{ cur.kind === 'grid' ? '松弛节点' : 'PV / PQ' }}</dd></div>
      <div><dt>读数位置</dt><dd>见图上标注</dd></div>
    </dl>

    <div v-if="cur.units?.length" class="units">
      <div class="u-head"><span class="eyebrow">机组</span><span class="eyebrow">出力</span></div>
      <div v-for="u in cur.units" :key="u.name" class="u-row">
        <span class="num">{{ u.name }}</span>
        <span class="u-bar"><i :style="{ width: Math.min(100, (u.mw / 160) * 100) + '%' }" /></span>
        <span class="num u-val">{{ u.mw.toFixed(1) }}<em>MW</em></span>
      </div>
    </div>

    <div class="hr" />

    <div class="index">
      <div class="i-head">
        <span class="eyebrow">全部节点</span>
        <span class="eyebrow">P / MW</span>
      </div>
      <div
        v-for="b in buses"
        :key="b.id"
        class="i-row"
        :class="{ on: b.id === selected }"
        @click="$emit('select', b.id)"
      >
        <i class="st" :class="b.read.state" />
        <span class="i-id num">{{ String(b.id).padStart(2, '0') }}</span>
        <span class="i-nm">{{ b.name }}</span>
        <span class="num i-p">{{ b.read.p.toFixed(1) }}</span>
      </div>
    </div>

    <div class="sum">
      <span>全网注入</span>
      <b class="num">{{ total.toFixed(1) }} MW</b>
    </div>
  </aside>
</template>

<style scoped>
.dossier {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
  padding: 16px 16px 14px;
  border: 1px solid var(--rule);
  border-radius: var(--r-lg);
  background: var(--zone-bg);
  box-shadow: var(--zone-shadow);
  min-height: 0;
}

.head { display: flex; align-items: center; justify-content: space-between; }
.idx { font-size: 10px; color: var(--t4); }

.title { display: flex; align-items: baseline; justify-content: space-between; gap: var(--s2); }
.title h2 { margin: 0; font-size: 19px; font-weight: 600; letter-spacing: 0.4px; }
.state {
  font-family: var(--font-cn);
  font-size: 10.5px;
  letter-spacing: 0.4px;
  padding: 3px 9px;
  border: 1px solid currentColor;
  border-radius: var(--r-pill);
}
.state.normal { color: var(--sig-ice); }
.state.warn { color: var(--alarm); }

.facts {
  margin: 0;
  display: grid;
  gap: 1px;
  background: var(--rule-soft);
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}
.facts div {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 6px 2px;
}
.facts dt { font-size: 11.5px; color: var(--t4); }
.facts dd { margin: 0; font-size: 12.5px; color: var(--t2); }

.units { display: grid; gap: 5px; }
.u-head { display: flex; justify-content: space-between; }
.u-row {
  display: grid;
  grid-template-columns: 26px 1fr 62px;
  align-items: center;
  gap: var(--s2);
  font-size: 11.5px;
  color: var(--t2);
}
.u-bar { height: 2px; background: var(--rule); position: relative; }
.u-bar i { position: absolute; inset: 0 auto 0 0; background: var(--sig); }
.u-val { text-align: right; color: var(--t1); font-size: 12.5px; }
.u-val em { font-style: normal; font-family: var(--font-mono); font-size: 8px; color: var(--t4); margin-left: 3px; }

.index { display: grid; gap: 1px; overflow-y: auto; overflow-x: hidden; min-height: 0; }
.index::-webkit-scrollbar { width: 0; }
.i-head { display: flex; justify-content: space-between; padding-bottom: 4px; }
.i-row {
  display: grid;
  grid-template-columns: 8px 22px 1fr 46px;
  align-items: center;
  gap: var(--s2);
  padding: 4px 4px;
  font-size: 12.5px;
  color: var(--t2);
  cursor: pointer;
  border-radius: var(--r-sm);
}
.i-row:hover { background: rgba(90, 169, 255, 0.05); color: var(--t1); }
.i-row.on { background: var(--sig-dim); color: var(--t1); }
.st { width: 4px; height: 4px; border-radius: 50%; background: var(--sig-ice); }
.st.warn { background: var(--alarm); }
.i-id { font-size: 10.5px; color: var(--t4); }
.i-p { text-align: right; font-size: 12.5px; }

.sum {
  margin-top: auto;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: var(--s2);
  border-top: 1px solid var(--rule);
  font-size: 11.5px;
  color: var(--t3);
}
.sum b { font-size: 14px; color: var(--t1); }

@media (max-height: 980px) {
  .dossier { gap: 8px; }
  .title h2 { font-size: 17px; }
  .facts div { padding: 4px 0; }
  .i-row { padding: 2px 4px; }
  .u-row { gap: 6px; }
}</style>
