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
      <div class="title-block">
        <div class="title-row">
          <span class="title-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
              <path d="M7 8a5 5 0 0 1 10 0v5a5 5 0 0 1-10 0z"/>
              <path d="M6 10H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h2"/>
              <path d="M18 10h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/>
              <path d="M9 3h6"/>
            </svg>
          </span>
          <div>
            <h1 class="app-title">C & J Cookbook</h1>
            <p class="app-subtitle text-muted">Collect, cook, and cherish every favorite.</p>
          </div>
        </div>
        <div class="title-icons" aria-hidden="true">
          <span>🍓</span>
          <span>🥐</span>
          <span>🍳</span>
        </div>
      </div>
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
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(209, 250, 229, 0.35));
  border-bottom: 1px solid var(--border);
  padding: 1rem 0 1.25rem;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(6px);
}

:global([data-theme='dark']) .app-header {
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(5, 150, 105, 0.2));
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

.title-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--primary-light);
  color: var(--primary);
  box-shadow: var(--shadow);
}

.title-icon svg {
  width: 24px;
  height: 24px;
}

.app-title {
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--text);
}

.app-subtitle {
  margin-top: 0.15rem;
  font-size: 0.85rem;
}

.title-icons {
  display: flex;
  gap: 0.4rem;
}

.title-icons span {
  font-size: 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.25rem 0.5rem;
  box-shadow: var(--shadow);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    align-items: flex-start;
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

  .title-row {
    align-items: flex-start;
  }

  .title-icons {
    flex-wrap: wrap;
  }

  .header-actions {
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 0.25rem;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
  }

  .header-actions .btn {
    flex: 0 0 auto;
    white-space: nowrap;
    scroll-snap-align: start;
  }
}
</style>
