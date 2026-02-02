<script setup>
defineProps({
  isBackfilling: {
    type: Boolean,
    default: false
  },
  isDemoMode: {
    type: Boolean,
    default: false
  },
  theme: {
    type: String,
    default: 'light'
  }
})

defineEmits(['add-recipe', 'import-recipes', 'backfill-ingredients', 'export-backup', 'toggle-theme'])
</script>

<template>
  <header class="app-header">
    <div v-if="isDemoMode" class="demo-banner">
      Demo mode: local data only
    </div>
    <div class="container header-content">
      <h1 class="app-title">C & J Cookbook</h1>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="$emit('toggle-theme')">
          {{ theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
        </button>
        <button class="btn btn-secondary" @click="$emit('import-recipes')">
          Import
        </button>
        <button class="btn btn-secondary" @click="$emit('export-backup')">
          Export Backup
        </button>
        <button
          class="btn btn-secondary"
          :disabled="isBackfilling"
          @click="$emit('backfill-ingredients')"
        >
          {{ isBackfilling ? 'Backfilling...' : 'Backfill Ingredients' }}
        </button>
        <button class="btn btn-primary" @click="$emit('add-recipe')">
          Add Recipe
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: var(--surface);
  border-bottom: 2px solid var(--border);
  padding: 1rem 0;
}

.demo-banner {
  background: var(--primary-light);
  color: var(--text);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 1rem;
  border-bottom: 2px solid var(--border);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.app-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .app-title {
    flex: 1 1 100%;
  }

  .header-actions {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: flex-start;
    overflow: visible;
  }
}
</style>
