<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <section class="panel">
    <span class="corner-bl" aria-hidden="true"></span>
    <header class="panel-title">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <slot name="icon">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </slot>
      </svg>
      <span>{{ title }}</span>
      <span class="spacer"></span>
      <slot name="actions" />
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>