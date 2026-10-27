<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ scenario: string }>()
const emit = defineEmits<{ (e: 'submit'): void }>()

const sceneName = computed(() => {
  const map: Record<string, string> = {
    typical: '典型日运行',
    extreme: '极端天气',
    fault: '故障恢复',
    highre: '高比例新能源',
    winter: '冬季低温',
    multi: '多源协同',
  }
  return map[props.scenario] ?? '典型日运行'
})

const topologies = [
  { id: 'multi', name: '多源互联电网', note: '9 母线 · 525 kV' },
  { id: 'hydro', name: '水光互补送出', note: '12 母线 · 常直' },
  { id: 'wind', name: '风电交直流', note: 'MMC-HVDC' },
]
const activeTopo = ref('multi')

const params = ref([
  { key: 'pv', label: '光伏出力', value: 62, unit: '%' },
  { key: 'wind', label: '风电出力', value: 48, unit: '%' },
  { key: 'load', label: '负荷水平', value: 71, unit: '%' },
  { key: 'soc', label: '储能 SOC', value: 54, unit: '%' },
])




const submitting = ref(false)
function submit() {
  if (submitting.value) return
  submitting.value = true
  emit('submit')
  window.setTimeout(() => (submitting.value = false), 1600)
}
</script>

<template>
  <aside class="rack">
    <div class="rack-head">
      <span class="eyebrow">控制台 / CONSOLE</span>
      <span class="light"><i />引擎就绪</span>
    </div>

    <section class="blk">
      <h3>拓扑<em>03</em></h3>
      <button
        v-for="t in topologies"
        :key="t.id"
        class="opt"
        :class="{ on: activeTopo === t.id }"
        @click="activeTopo = t.id"
      >
        <span class="dot" />
        <span class="t-name">{{ t.name }}</span>
        <span class="t-note">{{ t.note }}</span>
      </button>
    </section>

    <section class="blk">
      <h3>能源参数<em>%</em></h3>
      <label v-for="p in params" :key="p.key" class="fader">
        <span class="f-label">{{ p.label }}</span>
        <span class="f-track">
          <i class="f-ticks" />
          <i class="f-fill" :style="{ width: p.value + '%' }" />
          <i class="f-knob" :style="{ left: p.value + '%' }" />
        </span>
        <span class="f-val num">{{ p.value }}</span>
        <input v-model.number="p.value" type="range" min="0" max="100" step="1" class="f-input" :aria-label="p.label" />
      </label>
    </section>

    <section class="blk muted">
      <h3>故障设置<em>未启用</em></h3>
      <p class="note">内核 system-case-v1 暂不支持拓扑切换与短路故障事件，该组参数提交时将被忽略。</p>
      <div class="fake-field">线路故障 · 10 kV 母线 1</div>
    </section>


    <section class="summary">
      <div><span>拓扑</span><b>多源互联电网</b></div>
      <div><span>工况</span><b>{{ sceneName }}</b></div>
      <div><span>源 / 荷 / SOC</span><b class="num">62 · 48 · 71 · 54</b></div>
      <div><span>预计时长</span><b class="num">8.4 s</b></div>
    </section>

    <footer class="rack-foot">
      <div><span>MATLAB 引擎</span><b class="num">idle</b></div>
      <div><span>队列</span><b class="num">2 / 8</b></div>
      <div><span>最近仿真</span><b class="num">8.4 s</b></div>
    </footer>

    <button class="submit" :class="{ busy: submitting }" @click="submit">
      {{ submitting ? '已提交 · 排队中' : '提交仿真任务' }}
      <span class="num">{{ submitting ? 'QUEUED' : 'RUN →' }}</span>
    </button>
  </aside>
</template>

<style scoped>
.rack {
  display: flex;
  flex-direction: column;
  gap: var(--s4);
  padding: 16px 16px 14px;
  border: 1px solid var(--rule);
  border-radius: var(--r-lg);
  background: var(--zone-bg);
  box-shadow: var(--zone-shadow);
  min-height: 0;
}

.rack-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.light {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--t3);
}
.light i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--sig-ice);
  box-shadow: 0 0 6px var(--sig);
}

.blk h3 {
  margin: 0 0 10px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--t2);
  letter-spacing: 0.5px;
}
.blk h3 em {
  font-style: normal;
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--t4);
  letter-spacing: 1px;
}

/* 拓扑列表 */
.opt {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  align-items: center;
  gap: var(--s2);
  width: 100%;
  padding: 8px 10px;
  text-align: left;
  border-radius: var(--r-sm);
  transition: background 0.15s;
}
.opt:hover { background: rgba(90, 169, 255, 0.05); }
.opt .dot {
  width: 5px;
  height: 5px;
  border: 1px solid var(--t4);
  border-radius: 50%;
}
.opt.on {
  background: var(--sig-dim);
}
.opt.on .dot { background: var(--sig-ice); border-color: var(--sig-ice); }
.t-name { font-size: 13px; color: var(--t2); }
.opt.on .t-name { color: var(--t1); }
.t-note {
  font-family: var(--font-mono);
  font-size: 8px;
  color: var(--t4);
}

.summary {
  display: grid;
  gap: 4px;
  padding: var(--s3) 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}
.summary div {
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--t4);
}
.summary b {
  font-weight: 400;
  color: var(--t2);
  font-size: 11.5px;
}

/* 推子 */.fader {
  position: relative;
  display: grid;
  grid-template-columns: 56px 1fr 26px;
  align-items: center;
  gap: var(--s2);
  padding: 6px 0;
  cursor: ew-resize;
}
.f-label { font-size: 12.5px; color: var(--t3); }
.f-track {
  position: relative;
  height: 18px;
  display: block;
}
.f-ticks {
  position: absolute;
  inset: 8px 0 8px 0;
  background:
    repeating-linear-gradient(90deg, var(--rule-strong) 0 1px, transparent 1px 10%),
    linear-gradient(var(--rule), var(--rule));
  background-size: 100% 6px, 100% 1px;
  background-repeat: no-repeat;
  background-position: 0 0, 0 50%;
}
.f-fill {
  position: absolute;
  left: 0;
  top: 8px;
  height: 2px;
  background: var(--sig);
  box-shadow: 0 0 8px rgba(90, 169, 255, 0.55);
}
.f-knob {
  position: absolute;
  top: 2px;
  width: 2px;
  height: 14px;
  background: var(--t1);
  transform: translateX(-1px);
  box-shadow: 0 0 0 1px rgba(6, 12, 20, 0.9);
}
.f-val {
  font-size: 15px;
  color: var(--t1);
  text-align: right;
}
.f-input {
  position: absolute;
  inset: 0;
  width: 100%;
  opacity: 0;
  cursor: ew-resize;
}

/* 故障设置（未启用） */
.blk.muted .note {
  margin: 0 0 10px;
  font-size: 10px;
  line-height: 1.5;
  color: var(--t4);
}
.fake-field {
  padding: 6px 8px;
  border: 1px dashed var(--rule);
  border-radius: var(--r-sm);
  font-family: var(--font-cn);
  font-size: 11.5px;
  color: var(--t3);
}

/* 工况 */
.chips { display: flex; flex-wrap: wrap; gap: var(--s1); }
.chip {
  padding: 5px 12px;
  border: 1px solid var(--rule);
  border-radius: var(--r-pill);
  font-size: 11.5px;
  color: var(--t3);
  transition: all 0.15s;
}
.chip:hover { color: var(--t1); border-color: var(--rule-strong); }
.chip.on {
  color: var(--ink-0);
  background: var(--sig-ice);
  border-color: var(--sig-ice);
}

/* 提交 */
.submit {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink-1);
  background: var(--sig);
  border-radius: var(--r-md);
  transition: background 0.15s, transform 0.1s;
}
.submit:hover { background: var(--sig-ice); }
.submit:active { transform: translateY(1px); }
.submit .num { font-size: 9px; letter-spacing: 1px; opacity: 0.75; }
.submit.busy { background: var(--t3); color: var(--t1); }

.rack-foot {
  display: grid;
  gap: 3px;
  padding-top: var(--s3);
  border-top: 1px solid var(--rule);
  font-size: 11.5px;
  color: var(--t3);
}
.rack-foot div { display: flex; justify-content: space-between; }
.rack-foot b { color: var(--t2); font-weight: 400; font-size: 11.5px; }
</style>
