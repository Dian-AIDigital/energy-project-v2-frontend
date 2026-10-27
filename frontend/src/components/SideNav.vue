<script setup lang="ts">
const props = defineProps<{ tab: string }>()
const emit = defineEmits<{ (e: 'go', tab: string): void }>()

const groups = [
  {
    title: '工作区',
    items: [
      { id: 'overview', name: '运行概览', icon: 'overview' },
      { id: 'topology', name: '拓扑视图', icon: 'topology' },
      { id: 'config', name: '参数配置', icon: 'config' },
    ],
  },
  {
    title: '数据',
    items: [
      { id: 'scenarios', name: '场景库', icon: 'scenarios' },
      { id: 'tasks', name: '仿真任务', icon: 'tasks' },
    ],
  },
  {
    title: '系统',
    items: [{ id: 'settings', name: '引擎与设置', icon: 'settings' }],
  },
]
const ic: Record<string, string> = {
  overview: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2.2" y="2.2" width="4.6" height="4.6" rx="1"/><rect x="9.2" y="2.2" width="4.6" height="3.2" rx="1"/><rect x="2.2" y="9.2" width="4.6" height="4.6" rx="1"/><rect x="9.2" y="7.2" width="4.6" height="6.6" rx="1"/></svg>',
  topology: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="3" cy="8" r="1.6"/><circle cx="13" cy="4" r="1.6"/><circle cx="13" cy="12" r="1.6"/><path d="M4.6 8H8m0 0l3.4-3.2M8 8l3.4 3.2"/></svg>',
  config: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 5.5h12M2 10.5h12"/><circle cx="6" cy="5.5" r="1.7"/><circle cx="11" cy="10.5" r="1.7"/></svg>',
  scenarios: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M8 2.2l5.6 2.8L8 7.8 2.4 5 8 2.2z"/><path d="M2.4 8.4L8 11.2l5.6-2.8"/><path d="M2.4 11.4L8 14.2l5.6-2.8"/></svg>',
  tasks: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 4.2h10M3 8h10M3 11.8h6"/></svg>',
  settings: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="2.1"/><path d="M8 2.2v1.8M8 12v1.8M2.2 8H4M12 8h1.8M3.9 3.9l1.3 1.3M10.8 10.8l1.3 1.3M12.1 3.9l-1.3 1.3M5.2 10.8l-1.3 1.3"/></svg>',
}
</script>

<template>
  <aside class="side">
    <div class="brand">
      <span class="glyph" />
      <span class="word">NESP</span>
    </div>

    <button class="workspace">
      <span class="ws-ic">荷</span>
      <span class="ws-text">
        <b>新能源荷储实证平台</b>
        <em>Production · 华东园区</em>
      </span>
      <span class="caret">▾</span>
    </button>

    <nav class="nav">
      <section v-for="g in groups" :key="g.title">
        <p class="label">{{ g.title }}</p>
        <button
          v-for="it in g.items"
          :key="it.id"
          class="item"
          :class="{ on: tab === it.id }"
          @click="emit('go', it.id)"
        >
          <span class="ic" v-html="ic[it.icon]" />
          <span>{{ it.name }}</span>
        </button>
      </section>
    </nav>

    <footer class="foot">
      <div class="engine">
        <div class="row"><span class="label">下一次仿真</span></div>
        <div class="eng-num">
          <b class="num">今天 21:00</b>
          <em>距现在 1 小时 12 分</em>
        </div>
        <div class="eng-line">
          <span><i class="dot ok" />MATLAB 引擎在线</span>
          <b class="num">99.9%</b>
        </div>
      </div>
      <div class="user">
        <span class="avatar">LD</span>
        <span class="u-text">
          <b>刘定蔼</b>
          <em>仿真负责人</em>
        </span>
      </div>
    </footer>
  </aside>
</template>

<style scoped>
.side {
  width: 232px;
  flex: none;
  height: 100%;
  padding: 18px 12px 14px;
  background: #efeee9;
  border-right: 1px solid var(--bd);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px 4px;
}
.glyph {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: var(--ink);
  clip-path: polygon(0 0, 100% 0, 100% 62%, 62% 100%, 0 100%);
}
.word {
  font-size: 13px;
  letter-spacing: 0.28em;
  font-weight: 600;
}

.workspace {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border: 1px solid var(--bd);
  border-radius: var(--r-sm);
  background: #fff;
  text-align: left;
}
.ws-ic {
  width: 24px;
  height: 24px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: var(--ink);
  color: #f7f5ee;
  font-size: 12px;
}
.ws-text { display: grid; min-width: 0; }
.ws-text b {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ws-text em {
  font-style: normal;
  font-size: 10.5px;
  color: var(--t3);
}
.caret { margin-left: auto; color: var(--t3); font-size: 10px; }

.nav {
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
}
.nav section p {
  margin: 0 0 4px;
  padding-left: 10px;
}
.item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 7px 10px;
  border-radius: var(--r-sm);
  font-size: 12.5px;
  color: var(--t2);
  text-align: left;
}
.item:hover { background: #e7e5de; }
.item.on {
  background: var(--ink);
  color: #f7f5ee;
}
.ic {
  width: 15px;
  height: 15px;
  display: inline-flex;
  color: var(--t3);
  flex: none;
}
.ic :deep(svg) { width: 15px; height: 15px; }
.item.on .ic { color: #f7f5ee; }
.item.on .ic { opacity: 0.9; }

.foot { margin-top: auto; display: grid; gap: 12px; }

.engine {
  border: 1px solid var(--bd);
  border-radius: var(--r-sm);
  background: #fff;
  padding: 10px 11px;
}
.engine .row { margin-bottom: 2px; }
.eng-num { display: grid; }
.eng-num b { font-size: 13px; }
.eng-num em { font-style: normal; font-size: 10.5px; color: var(--t3); }
.eng-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 7px;
  padding-top: 7px;
  border-top: 1px solid var(--bd);
  font-size: 10.5px;
  color: var(--t3);
}
.eng-line span { display: inline-flex; align-items: center; gap: 5px; }
.eng-line b { color: var(--t2); font-weight: 500; }

.user {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 9px;
  border-radius: var(--r-sm);
  background: #fff;
  border: 1px solid var(--bd);
}
.avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #e5e2d8;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--t2);
}
.u-text { display: grid; }
.u-text b { font-size: 12px; font-weight: 600; }
.u-text em { font-style: normal; font-size: 10.5px; color: var(--t3); }
</style>
