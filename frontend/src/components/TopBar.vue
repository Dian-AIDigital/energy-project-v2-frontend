<script setup lang="ts">
defineProps<{ title: string; sub?: string; badge?: string }>()
const emit = defineEmits<{ (e: 'new'): void; (e: 'export'): void }>()
</script>

<template>
  <header class="top">
    <div class="left">
      <h1>{{ title }}</h1>
      <span v-if="badge" class="badge">{{ badge }}</span>
      <span class="sync"><i class="dot ok" />{{ sub ?? '数据同步于 24 秒前' }}</span>
    </div>

    <div class="right">
      <label class="search">
        <span class="mag">⌕</span>
        <input placeholder="搜索任务、拓扑、场景" />
        <kbd>⌘K</kbd>
      </label>
      <button class="btn" @click="emit('export')">导出</button>
      <button class="btn primary" @click="emit('new')">新建仿真 · 提交</button>
    </div>
  </header>
</template>

<style scoped>
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 16px 24px 14px;
  background: var(--card);
  border-bottom: 1px solid var(--bd);
}
.left { display: flex; align-items: center; gap: 10px; min-width: 0; }
h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.2px;
}
.badge {
  padding: 2px 8px;
  border-radius: var(--r-pill);
  border: 1px solid var(--bd-strong);
  background: var(--card-soft);
  font-size: 11px;
  color: var(--t2);
}
.sync {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--t3);
  white-space: nowrap;
}

.right { display: flex; align-items: center; gap: 8px; }
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 268px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--bd-strong);
  border-radius: var(--r-sm);
  background: #fff;
  color: var(--t3);
}
.mag { font-size: 14px; }
.search input {
  flex: 1;
  min-width: 0;
  font-size: 12.5px;
  color: var(--t1);
  outline: none;
}
.search input::placeholder { color: var(--t4); }
kbd {
  font-family: var(--font);
  font-size: 10px;
  color: var(--t3);
  border: 1px solid var(--bd);
  border-radius: 4px;
  padding: 1px 4px;
}
</style>
