<script setup>
defineEmits(['add-recipe', 'import-recipes'])
</script>

<template>
  <header class="app-header">
    <div class="container header-content">
      <h1 class="app-title">C & J Cookbook</h1>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="$emit('import-recipes')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import
        </button>
        <button class="btn btn-primary" @click="$emit('add-recipe')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Recipe
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }
}
</style>
