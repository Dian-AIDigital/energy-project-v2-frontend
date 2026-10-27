<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"
import { useDashboardStore } from "../stores/dashboard"

const store = useDashboardStore()
const now = ref(new Date())
const skin = ref("")
let timer: number | undefined

function fmt() {
  const d = now.value
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

onMounted(() => {
  skin.value = new URLSearchParams(location.search).get("skin") || "tex"
  timer = window.setInterval(() => (now.value = new Date()), 1000)
})
onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <header class="header" :class="skin ? ['skin-' + skin] : []">
    <div class="hull">
      <div class="rail" aria-hidden="true"></div>
      <div class="rail-glow" aria-hidden="true"></div>

      <div class="port">
        <div class="cell">
          <span class="k">TOPOLOGY</span>
          <span class="v">{{ store.currentTopology.name }}</span>
        </div>
        <div class="cell">
          <span class="k">SCENARIO</span>
          <span class="v">{{ store.condition }}</span>
        </div>
      </div>

      <div class="center">
        <svg class="cal left" viewBox="0 0 240 34" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">
          <path d="M240 17H152l-14-9H74M240 17h-62l-13 10H92M240 17h-38"/>
          <rect x="64" y="15" width="4" height="4" fill="currentColor" stroke="none"/>
        </svg>
        <h1>新能源荷储技术实证平台</h1>
        <svg class="cal right" viewBox="0 0 240 34" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">
          <path d="M240 17H152l-14-9H74M240 17h-62l-13 10H92M240 17h-38"/>
          <rect x="64" y="15" width="4" height="4" fill="currentColor" stroke="none"/>
        </svg>
      </div>

      <div class="starboard">
        <div class="cell">
          <span class="k">SYSTEM TIME</span>
          <span class="v time">{{ fmt() }}</span>
        </div>
        <div class="cell weather">
          <span class="k">WEATHER</span>
          <span class="v">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><circle cx="9" cy="9" r="3.6" fill="#ffd54d" stroke="#ffd54d"/><path d="M13.5 16a4 4 0 100-8 5 5 0 019.4 1.5A3.5 3.5 0 0120 16z" fill="rgba(255,255,255,.3)"/></svg>
            多云 22℃
          </span>
        </div>
        <div class="cell status">
          <span class="k">STATUS</span>
          <span class="v"><i class="dot"></i>系统运行正常</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: relative;
  flex: none;
  height: 64px;
  padding: 8px 0 0;
}

.hull {
  position: relative;
  height: 56px;
  background: var(--hull-bg);
  border-top: 1px solid var(--hull-line-top);
  border-bottom: 1px solid var(--hull-line-bottom);
  box-shadow: var(--hull-inset);
  clip-path: polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%, 0 20px);
}

/* 两条斜切边的 1px 描边 */
.hull::before,
.hull::after {
  content: "";
  position: absolute;
  top: 9.5px;
  width: 28.3px;
  height: 1px;
  background: rgba(0, 216, 255, 0.55);
  pointer-events: none;
}
.hull::before { left: -4px; transform: rotate(-45deg); }
.hull::after { right: -4px; transform: rotate(45deg); }

/* 顶部贯穿光带 */
.rail {
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 940px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--header-rail) 20%, var(--header-rail-core) 50%, var(--header-rail) 80%, transparent);
  box-shadow: 0 0 18px rgba(0, 216, 255, 0.85);
}

.rail-glow {
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 620px;
  height: 44px;
  pointer-events: none;
  background: radial-gradient(50% 100% at 50% 0%, rgba(0, 216, 255, 0.2), transparent 72%);
}

.center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 22px;
}

h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 3.5px;
  white-space: nowrap;
  background: var(--header-title-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 12px rgba(0, 216, 255, 0.65));
}

.cal {
  width: 240px;
  height: 34px;
  flex: none;
  color: var(--header-caliper);
  filter: drop-shadow(0 0 6px rgba(0, 216, 255, 0.55));
}
.cal.right { transform: scaleX(-1); }

.port,
.starboard {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}
.port { left: 22px; }
.starboard { right: 22px; }

.cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 18px;
  line-height: 1.15;
}
.port .cell:first-child { padding-left: 0; }
.starboard .cell:last-child { padding-right: 0; }
.cell + .cell { border-left: 1px solid var(--header-divider); }

.k {
  font-size: 9px;
  letter-spacing: 2.4px;
  color: var(--header-label);
  font-weight: 500;
}

.v {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
}

.v.time {
  font-family: var(--font-mono);
  letter-spacing: 0.5px;
}

.weather .v,
.status .v {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.weather .v svg { width: 14px; height: 14px; }
.status .v { color: var(--success); }

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex: none;
  background: var(--success);
  box-shadow: 0 0 7px var(--success);
}

/* ---- 去模板化外壳下的表头衔接 ---- */
.header.skin-layer .hull {
  border-bottom-color: transparent;
  box-shadow: var(--hull-inset), 0 16px 30px -18px rgba(0, 0, 0, 0.95);
}
.header.skin-layer .rail { box-shadow: 0 0 22px rgba(0, 216, 255, 0.9); }

.header.skin-frame .hull {
  border: none;
  border-bottom: 1px solid rgba(0, 216, 255, 0.16);
  background: linear-gradient(180deg, rgba(11, 40, 76, 0.82) 0%, rgba(4, 16, 34, 0.4) 100%);
  clip-path: none;
  box-shadow: none;
}
.header.skin-frame .hull::before,
.header.skin-frame .hull::after { display: none; }
.header.skin-frame .rail { width: 100%; }

.header.skin-node .hull {
  border: none;
  background: transparent;
  box-shadow: none;
  clip-path: none;
  overflow: visible;
}
.header.skin-node .hull::before,
.header.skin-node .hull::after { display: none; }
.header.skin-node .rail {
  width: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 216, 255, 0.55) 30%, rgba(0, 216, 255, 0.55) 70%, transparent);
  box-shadow: none;
  height: 1px;
}
.header.skin-node .rail-glow { display: none; }

/* ---- 纹理分层：表头加深 + 等高线 + 角件 + 底缘刻度 ---- */
.header.skin-tex .hull {
  background-color: rgba(4, 11, 26, 0.97);
  background-image:
    url("/ui/corner-lb.svg"),
    url("/ui/corner-rb.svg"),
    repeating-linear-gradient(90deg, rgba(0, 216, 255, 0.3) 0 1px, transparent 1px 24px),
    url("/tex/contour-soft.png");
  background-size: 38px 38px, 38px 38px, 100% 6px, 260px;
  background-position: left bottom, right bottom, left calc(100% - 0px), 0 0;
  background-repeat: no-repeat, no-repeat, no-repeat, repeat;
  border-top-color: rgba(0, 216, 255, 0.6);
  border-bottom-color: rgba(0, 216, 255, 0.32);
  box-shadow:
    inset 0 0 0 1px rgba(0, 216, 255, 0.1),
    inset 0 2px 0 rgba(150, 240, 255, 0.22),
    inset 0 -1px 0 rgba(0, 216, 255, 0.28),
    0 0 26px rgba(0, 150, 230, 0.3);
}
/* 标题两侧各一枚小菱形 */
.header.skin-tex h1::before,
.header.skin-tex h1::after {
  content: "";
  display: inline-block;
  width: 5px;
  height: 5px;
  margin: 0 14px;
  vertical-align: 6px;
  background: rgba(130, 244, 255, 0.9);
  transform: rotate(45deg);
  box-shadow: 0 0 8px rgba(0, 216, 255, 0.9);
}
/* 斜切边描边加粗提亮 */
.header.skin-tex .hull::before,
.header.skin-tex .hull::after {
  height: 2px;
  background: rgba(130, 244, 255, 0.95);
  box-shadow: 0 0 8px rgba(0, 216, 255, 0.9);
}
/* 左右舷各加一根竖向亮线，把信息区从舱体里“切”出来 */
.header.skin-tex .port { padding-left: 16px; }
.header.skin-tex .port::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 26px;
  background: linear-gradient(180deg, transparent, rgba(130, 244, 255, 0.85), transparent);
  box-shadow: 0 0 7px rgba(0, 216, 255, 0.8);
}
.header.skin-tex .starboard { padding-right: 16px; }
.header.skin-tex .starboard::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 26px;
  background: linear-gradient(180deg, transparent, rgba(130, 244, 255, 0.85), transparent);
  box-shadow: 0 0 7px rgba(0, 216, 255, 0.8);
}
/* 标题两侧的卡尺提亮 */
.header.skin-tex .cal { color: rgba(120, 240, 255, 0.95); filter: drop-shadow(0 0 6px rgba(0, 216, 255, 0.85)); }
.header.skin-tex .rail { box-shadow: 0 0 22px rgba(0, 216, 255, 0.95); }
</style>
