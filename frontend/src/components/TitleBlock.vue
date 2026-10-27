<script setup lang="ts">
defineProps<{ selected: string }>()
const today = new Date()
const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
</script>

<template>
  <div class="tb" aria-label="图签">
    <div class="row">
      <div class="cell wide">
        <span class="k">项目</span>
        <span class="v">新能源荷储平台</span>
      </div>
      <div class="cell">
        <span class="k">图号</span>
        <span class="v num">NESP-2603</span>
      </div>
    </div>
    <div class="row">
      <div class="cell">
        <span class="k">选中</span>
        <span class="v">{{ selected }}</span>
      </div>
      <div class="cell">
        <span class="k">比例</span>
        <span class="v num">1 : 1</span>
      </div>
      <div class="cell">
        <span class="k">日期</span>
        <span class="v num">{{ stamp }}</span>
      </div>
      <div class="cell">
        <span class="k">校核</span>
        <span class="v">内核 v1</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tb {
  position: absolute;
  border-radius: var(--r-md);
  overflow: hidden;
  right: 20px;
  bottom: 18px;
  width: 420px;
  border: 1px solid var(--rule-strong);
  background: var(--float-bg);
  font-size: 11.5px;
  pointer-events: none;
}
.row {
  display: flex;
}
.row + .row {
  border-top: 1px solid var(--rule);
}
.cell {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 5px 9px;
  flex: 1;
  min-width: 0;
}
.cell + .cell {
  border-left: 1px solid var(--rule);
}
.cell.wide { flex: 2.6; }
.k {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 1px;
  color: var(--t4);
  flex: none;
}
.v {
  color: var(--t2);
  font-size: 11.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
