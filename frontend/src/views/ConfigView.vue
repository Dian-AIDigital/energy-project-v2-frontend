<script setup lang="ts">
import { ref } from 'vue'

const topologies = [
  { id: 'multi', name: '多源互联电网', note: '9 母线 · 525 kV' },
  { id: 'hydro', name: '水光互补送出', note: '12 母线 · 常直' },
  { id: 'wind', name: '风电交直流', note: 'MMC-HVDC' },
]
const activeTopo = ref('multi')

const params = ref([
  { key: 'pv', label: '光伏出力', value: 62 },
  { key: 'wind', label: '风电出力', value: 48 },
  { key: 'load', label: '负荷水平', value: 71 },
  { key: 'soc', label: '储能 SOC', value: 54 },
])
const conditions = ['典型日运行', '冬季低谷', '高比例新能源', '极端天气']
const cond = ref('典型日运行')
const submitted = ref(false)
</script>

<template>
  <div class="view">
    <section class="card form">
      <header>
        <h2>新建仿真任务</h2>
        <p class="meta">参数将随任务一并存档，可在任务详情中复现</p>
      </header>

      <div class="block">
        <span class="label">拓扑</span>
        <div class="opts">
          <button
            v-for="t in topologies"
            :key="t.id"
            class="opt"
            :class="{ on: activeTopo === t.id }"
            @click="activeTopo = t.id"
          >
            <b>{{ t.name }}</b>
            <em>{{ t.note }}</em>
          </button>
        </div>
      </div>

      <div class="block">
        <span class="label">能源参数</span>
        <label v-for="p in params" :key="p.key" class="slider">
          <span class="s-label">{{ p.label }}</span>
          <input v-model.number="p.value" type="range" min="0" max="100" step="1" />
          <span class="s-val num">{{ p.value }}<em>%</em></span>
        </label>
      </div>

      <div class="block">
        <span class="label">工况</span>
        <div class="chips">
          <button v-for="c in conditions" :key="c" class="chip" :class="{ on: cond === c }" @click="cond = c">
            {{ c }}
          </button>
        </div>
      </div>

      <div class="block muted">
        <div class="muted-head">
          <span class="label">故障设置</span>
          <span class="tag">暂不支持</span>
        </div>
        <p class="meta">
          内核 <code>system-case-v1</code> 暂不支持拓扑切换与短路故障事件，该组参数提交时会被忽略。
        </p>
        <div class="ghost-fields">
          <span>线路故障</span><span>10 kV 母线 1</span><span>未启用</span>
        </div>
      </div>

      <footer class="submit">
        <div class="sum">
          <span class="label">本次提交</span>
          <p>多源互联电网 · {{ cond }} · 光伏 62 / 风电 48 / 负荷 71 / SOC 54</p>
        </div>
        <div class="acts">
          <button class="btn">保存草稿</button>
          <button class="btn primary" @click="submitted = true">
            {{ submitted ? '已提交 · 排队中' : '提交仿真任务' }}
          </button>
        </div>
      </footer>
    </section>

    <aside class="card tips">
      <span class="label">提交说明</span>
      <ul>
        <li>提交后进入队列，单任务耗时约 8—15 s</li>
        <li>任务完成后波形与节点读数在「运行概览」查看</li>
        <li>参数集可在任务详情中另存为场景</li>
      </ul>
      <div class="engine">
        <span class="label">引擎</span>
        <p><i class="dot ok" />MATLAB · fsolve + ode15s 在线</p>
        <p class="num">队列 2 / 8 · 最近 8.4 s</p>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.view {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 292px;
  gap: 14px;
  padding: 18px 24px 24px;
  align-content: start;
}
.card { padding: 18px 20px; }
header h2 { margin: 0 0 3px; font-size: 16px; font-weight: 600; }
.meta { margin: 0; font-size: 11.5px; color: var(--t3); }

.block { margin-top: 20px; display: grid; gap: 8px; }
.block .label { display: block; }

.opts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.opt {
  text-align: left;
  padding: 12px 14px;
  border: 1px solid var(--bd);
  border-radius: var(--r-sm);
  background: #fff;
  display: grid;
  gap: 3px;
}
.opt:hover { border-color: var(--bd-strong); }
.opt.on { border-color: var(--ink); box-shadow: inset 0 0 0 1px var(--ink); }
.opt b { font-size: 13px; font-weight: 600; }
.opt em { font-style: normal; font-size: 11px; color: var(--t3); }

.slider {
  display: grid;
  grid-template-columns: 72px 1fr 54px;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
}
.s-label { font-size: 12.5px; color: var(--t2); }
input[type='range'] {
  -webkit-appearance: none;
  height: 3px;
  border-radius: 2px;
  background: #e8e5dc;
  outline: none;
}
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--ink);
  cursor: pointer;
}
.s-val { text-align: right; font-size: 13px; }
.s-val em { font-style: normal; font-size: 10.5px; color: var(--t3); margin-left: 2px; }

.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chip {
  padding: 6px 12px;
  border-radius: var(--r-pill);
  border: 1px solid var(--bd);
  font-size: 12px;
  color: var(--t2);
  background: #fff;
}
.chip:hover { border-color: var(--bd-strong); }
.chip.on { background: var(--ink); color: #f7f5ee; border-color: var(--ink); }

.muted { opacity: 0.85; }
.muted-head { display: flex; align-items: center; gap: 8px; }
.tag {
  padding: 1px 7px;
  border-radius: var(--r-pill);
  background: var(--amber-soft);
  color: var(--amber);
  font-size: 10.5px;
}
code { font-family: var(--font); background: var(--card-soft); padding: 1px 5px; border-radius: 4px; }
.ghost-fields { display: flex; gap: 8px; }
.ghost-fields span {
  padding: 6px 10px;
  border: 1px dashed var(--bd-strong);
  border-radius: var(--r-sm);
  font-size: 11.5px;
  color: var(--t3);
}

.submit {
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid var(--bd);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}
.sum p { margin: 4px 0 0; font-size: 12px; color: var(--t2); }
.acts { display: flex; gap: 8px; }

.tips { display: grid; gap: 14px; align-content: start; }
.tips ul { margin: 0; padding-left: 16px; display: grid; gap: 7px; font-size: 12px; color: var(--t2); }
.engine { border-top: 1px solid var(--bd); padding-top: 12px; display: grid; gap: 4px; }
.engine p { margin: 0; font-size: 11.5px; color: var(--t2); display: flex; align-items: center; gap: 6px; }
</style>
