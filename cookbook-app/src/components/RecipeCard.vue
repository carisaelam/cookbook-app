<script setup>
defineProps({
  recipe: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete'])

function getDomain(url) {
  if (!url) return null
  try {
    const hostname = new URL(url).hostname
    return hostname.replace('www.', '')
  } catch {
    return null
  }
}
</script>

<template>
  <div class="recipe-card card">
    <div class="recipe-content">
      <a
        v-if="recipe.url"
        :href="recipe.url"
        target="_blank"
        rel="noopener noreferrer"
        class="recipe-name recipe-link"
      >
        {{ recipe.name }}
        <svg class="external-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>
      <span v-else class="recipe-name">{{ recipe.name }}</span>

      <div class="recipe-meta">
        <span v-if="recipe.url" class="recipe-domain text-muted text-sm">
          {{ getDomain(recipe.url) }}
        </span>
        <span v-else class="no-link text-muted text-sm">No link added</span>
      </div>

      <p v-if="recipe.notes" class="recipe-notes text-muted text-sm">
        {{ recipe.notes }}
      </p>
    </div>

    <div class="recipe-actions">
      <button class="btn btn-ghost btn-sm" @click="$emit('edit', recipe)" aria-label="Edit recipe">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="btn btn-ghost btn-sm" @click="$emit('delete', recipe)" aria-label="Delete recipe">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.recipe-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  transition: box-shadow 0.15s ease;
}

.recipe-card:hover {
  box-shadow: var(--shadow-lg);
}

.recipe-content {
  flex: 1;
  min-width: 0;
}

.recipe-name {
  font-weight: 600;
  color: var(--text);
  display: block;
  margin-bottom: 0.25rem;
}

.recipe-link {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.recipe-link:hover {
  color: var(--primary);
}

.external-icon {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.recipe-link:hover .external-icon {
  opacity: 1;
}

.recipe-meta {
  margin-bottom: 0.25rem;
}

.recipe-domain {
  display: inline-block;
}

.no-link {
  font-style: italic;
}

.recipe-notes {
  margin-top: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.recipe-card:hover .recipe-actions {
  opacity: 1;
}

@media (max-width: 768px) {
  .recipe-actions {
    opacity: 1;
  }
}
</style>
