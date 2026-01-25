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
          <svg v-if="theme === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
          </svg>
          {{ theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
        </button>
        <button class="btn btn-secondary" @click="$emit('import-recipes')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import
        </button>
        <button class="btn btn-secondary" @click="$emit('export-backup')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 16 12 21 17 16"/>
            <line x1="12" y1="3" x2="12" y2="21"/>
          </svg>
          Export Backup
        </button>
        <button
          class="btn btn-secondary"
          :disabled="isBackfilling"
          @click="$emit('backfill-ingredients')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-2.64-6.36"/>
            <polyline points="21 3 21 9 15 9"/>
          </svg>
          {{ isBackfilling ? 'Backfilling...' : 'Backfill Ingredients' }}
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
  padding: 0.75rem 0 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.demo-banner {
  background: var(--primary-light);
  color: #065f46;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 1rem;
  border-bottom: 1px solid rgba(5, 150, 105, 0.2);
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
