<script setup>
import { ref } from 'vue';

defineProps({
  isBackfilling: {
    type: Boolean,
    default: false,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
  isFirebaseConfigured: {
    type: Boolean,
    default: false,
  },
  isAuthLoading: {
    type: Boolean,
    default: false,
  },
  userEmail: {
    type: String,
    default: '',
  },
  theme: {
    type: String,
    default: 'light',
  },
});

defineEmits([
  'add-recipe',
  'import-recipes',
  'backfill-ingredients',
  'export-backup',
  'toggle-theme',
  'auth-action',
  'reset-filters',
]);

const isMenuOpen = ref(false);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}
</script>

<template>
  <header class="app-header">
    <div v-if="isFirebaseConfigured && !canEdit" class="demo-banner">
      Read-only mode. Sign in with an approved editor account to add or edit
      recipes.
    </div>
    <div class="container header-shell">
      <div class="header-brand">
        <h1 class="app-title">
          <button
            class="app-title-button"
            type="button"
            @click="
              closeMenu();
              $emit('reset-filters');
            "
          >
            C & J Cookbook
          </button>
        </h1>
      </div>

      <div class="header-actions">
        <div class="header-top-row">
          <div v-if="canEdit" class="header-primary-row">
            <button
              class="btn btn-primary btn-primary-row"
              @click="
                closeMenu();
                $emit('add-recipe');
              "
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Recipe
            </button>
          </div>

          <button
            class="btn btn-secondary btn-menu"
            type="button"
            :aria-expanded="isMenuOpen ? 'true' : 'false'"
            aria-label="Open library menu"
            @click="toggleMenu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <div v-if="isMenuOpen" class="header-menu card">
          <div class="header-group">
            <button
              v-if="isFirebaseConfigured"
              class="btn btn-secondary btn-menu-item"
              :disabled="isAuthLoading"
              @click="
                closeMenu();
                $emit('auth-action');
              "
            >
              {{
                isAuthLoading
                  ? 'Loading...'
                  : userEmail
                    ? 'Sign Out'
                    : 'Sign In'
              }}
            </button>
            <button
              class="btn btn-secondary btn-menu-item"
              @click="
                closeMenu();
                $emit('toggle-theme');
              "
            >
              <svg
                v-if="theme === 'dark'"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <svg
                v-else
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
              </svg>
              {{ theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
            </button>
            <button
              class="btn btn-secondary btn-menu-item"
              @click="
                closeMenu();
                $emit('export-backup');
              "
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 16 12 21 17 16" />
                <line x1="12" y1="3" x2="12" y2="21" />
              </svg>
              Export Backup
            </button>
          </div>

          <div v-if="canEdit" class="header-group header-group-editor">
            <button
              class="btn btn-secondary btn-menu-item"
              @click="
                closeMenu();
                $emit('import-recipes');
              "
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Import
            </button>
            <button
              class="btn btn-secondary btn-menu-item"
              :disabled="isBackfilling"
              @click="
                closeMenu();
                $emit('backfill-ingredients');
              "
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <polyline points="21 3 21 9 15 9" />
              </svg>
              {{ isBackfilling ? 'Backfilling...' : 'Backfill Ingredients' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: linear-gradient(180deg, var(--header-surface), var(--surface));
  border-bottom: 1px solid var(--border);
  padding: 0.9rem 0 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 14px 32px rgba(25, 31, 24, 0.08);
  backdrop-filter: blur(16px);
}

.demo-banner {
  background: rgba(185, 124, 65, 0.14);
  color: var(--accent-strong);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 1rem;
  border-bottom: 1px solid rgba(181, 126, 66, 0.2);
}

.header-shell {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.35rem;
}

.header-brand {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.app-title {
  font-size: clamp(2rem, 4.8vw, 3rem);
  font-weight: 700;
  color: var(--text);
  line-height: 1;
  letter-spacing: -0.05em;
  text-align: center;
}

.app-title-button {
  appearance: none;
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.app-title-button:hover {
  color: var(--accent-strong);
}

.app-title-button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
  border-radius: 4px;
}

.header-subtitle {
  max-width: 34rem;
}

.header-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.7rem;
  min-width: min(100%, 23rem);
}

.header-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.header-top-row {
  display: flex;
  align-items: stretch;
  gap: 0.7rem;
}

.btn-menu {
  min-height: 52px;
  min-width: 52px;
  padding: 0;
  border-radius: 16px;
  flex: 0 0 52px;
}

.header-menu {
  padding: 0.7rem;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
}

.header-group-editor {
  padding-top: 0.35rem;
  border-top: 1px solid var(--border);
}

.btn-menu-item {
  justify-content: flex-start;
  width: 100%;
  min-height: 44px;
}

.header-primary-row {
  flex: 1 1 auto;
}

.btn-primary-row {
  width: 100%;
  min-height: 52px;
  padding: 0.95rem 1.25rem;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 14px 24px rgba(5, 150, 105, 0.22);
}

@media (min-width: 769px) {
  .header-shell {
    align-items: start;
  }

  .header-actions {
    width: 23rem;
  }

  .header-menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    width: min(23rem, calc(100vw - 2.7rem));
  }

  .header-actions {
    position: relative;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding-bottom: 0.9rem;
  }

  .header-shell {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    min-width: 0;
  }

  .header-menu {
    border-radius: 1rem;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding-bottom: 1rem;
  }

  .app-title {
    font-size: 1.45rem;
  }
}
</style>
