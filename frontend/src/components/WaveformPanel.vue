<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"
import * as echarts from "echarts"
import { useDashboardStore } from "../stores/dashboard"
import GPanel from "./GPanel.vue"

const store = useDashboardStore()
const el = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

function render() {
  if (!el.value) return
  if (!chart) chart = echarts.init(el.value)
  const d = store.waveform
  chart.setOption({
    grid: { left: 44, right: 48, top: 10, bottom: 22 },
    tooltip: { trigger: "axis", backgroundColor: "rgba(3,15,36,.92)", borderColor: "rgba(0,180,255,.5)", textStyle: { color: "#e6f7ff", fontSize: 12 } },
    legend: { show: false },
    xAxis: { type: "category", data: d.times, axisLine: { lineStyle: { color: "rgba(127,168,201,.4)" } }, axisLabel: { color: "#7fa8c9", fontSize: 11, interval: 15 }, axisTick: { show: false }, boundaryGap: false },
    yAxis: [
      { type: "value", min: 0, max: 400, interval: 100, axisLabel: { color: "#7fa8c9", fontSize: 11 }, splitLine: { lineStyle: { color: "rgba(0,90,140,.16)" } } },
      { type: "value", min: 48.5, max: 50.5, interval: 0.5, axisLabel: { color: "#7fa8c9", fontSize: 11 }, splitLine: { show: false } }
    ],
    series: [
      { name: "电压(kV)", type: "line", showSymbol: false, smooth: true, lineStyle: { width: 2, color: "#00d8ff" }, itemStyle: { color: "#00d8ff" }, data: d.voltage },
      { name: "频率(Hz)", type: "line", showSymbol: false, smooth: true, yAxisIndex: 1, lineStyle: { width: 2, color: "#3ddc97" }, itemStyle: { color: "#3ddc97" }, data: d.frequency },
      { name: "有功功率(MW)", type: "line", showSymbol: false, smooth: true, lineStyle: { width: 2, color: "#ff9f40" }, itemStyle: { color: "#ff9f40" }, data: d.active },
      { name: "无功功率(MVar)", type: "line", showSymbol: false, smooth: true, lineStyle: { width: 2, color: "#9c6bff" }, itemStyle: { color: "#9c6bff" }, data: d.reactive }
    ]
  })
}

function resize() { chart?.resize() }

onMounted(() => {
  render()
  window.addEventListener("resize", resize)
})
onBeforeUnmount(() => {
  window.removeEventListener("resize", resize)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <GPanel title="波形图" class="wave-panel">
    <template #icon>
      <path d="M2 12h3l2-7 4 14 3-10 2 3h6" stroke-linecap="round" stroke-linejoin="round"/>
    </template>
    <div class="legend">
      <span class="li"><i style="--c: #00d8ff"></i>电压(kV)</span>
      <span class="li"><i style="--c: #3ddc97"></i>频率(Hz)</span>
      <span class="li"><i style="--c: #ff9f40"></i>有功功率(MW)</span>
      <span class="li"><i style="--c: #9c6bff"></i>无功功率(MVar)</span>
    </div>
    <div ref="el" class="chart"></div>
  </GPanel>
</template>

<style scoped>
.legend { display: flex; justify-content: center; gap: 14px; margin-bottom: 4px; flex-wrap: wrap; }
.li { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-secondary); }
.li i { width: 14px; height: 2px; background: var(--c); border-radius: 1px; box-shadow: 0 0 4px var(--c); }
.chart { flex: 1; min-height: 0; }
</style>