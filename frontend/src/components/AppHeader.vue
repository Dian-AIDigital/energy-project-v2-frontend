<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

const now = ref(new Date())
let timer: number | undefined

function fmt() {
  const d = now.value
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

onMounted(() => { timer = window.setInterval(() => (now.value = new Date()), 1000) })
onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <header class="header">
    <svg class="wing left" viewBox="0 0 200 60" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M198 30h-60l-20-14h-30M150 30l-16 12H96M178 30l-10-8M178 30l-10 8" />
      <circle cx="188" cy="30" r="2.5" fill="currentColor"/>
    </svg>
    <h1>新能源荷储技术实证平台</h1>
    <svg class="wing right" viewBox="0 0 200 60" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M2 30h60l20-14h30M50 30l16 12h38M22 30l10-8M22 30l10 8" />
      <circle cx="12" cy="30" r="2.5" fill="currentColor"/>
    </svg>

    <div class="meta">
      <span class="mono time">{{ fmt() }}</span>
      <span class="weather">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="9" r="3.6" fill="#ffd54d" stroke="#ffd54d"/><path d="M13.5 16a4 4 0 100-8 5 5 0 019.4 1.5A3.5 3.5 0 0120 16z" fill="rgba(255,255,255,.25)"/></svg>
        多云 22℃
      </span>
      <span class="sys ok">
        <i class="dot success"></i>系统运行正常
      </span>
    </div>
  </header>
</template>

<style scoped>
.header { position: relative; flex: none; height: 64px; display: flex; align-items: center; justify-content: center; }
h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--text-primary);
  text-shadow: var(--title-glow);
  white-space: nowrap;
}
.wing { width: 190px; height: 54px; color: rgba(0, 216, 255, 0.55); filter: drop-shadow(0 0 5px rgba(0,216,255,.4)); }
.wing.left { margin-right: 26px; }
.wing.right { margin-left: 26px; transform: scaleX(-1); }
.meta { position: absolute; right: 0; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 18px; font-size: 15px; }
.time { color: var(--text-primary); }
.weather { display: inline-flex; align-items: center; gap: 6px; color: var(--text-primary); }
.weather svg { width: 20px; height: 20px; }
.sys { display: inline-flex; align-items: center; gap: 7px; }
.sys.ok { color: var(--success); }

@media (max-width: 1500px) {
  .wing { display: none; }
}
</style>