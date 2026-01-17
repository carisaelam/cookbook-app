<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const localValue = ref(props.modelValue)
let debounceTimer = null

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
})

function handleInput(event) {
  localValue.value = event.target.value

  // Debounce the emit
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update:modelValue', localValue.value)
  }, 300)
}

function clearSearch() {
  localValue.value = ''
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="search-wrapper">
    <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
    <input
      type="text"
      class="search-input input"
      placeholder="Search recipes..."
      :value="localValue"
      @input="handleInput"
    />
    <button
      v-if="localValue"
      class="clear-btn"
      @click="clearSearch"
      aria-label="Clear search"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.search-wrapper {
  position: relative;
  max-width: 400px;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.clear-btn:hover {
  color: var(--text);
  background-color: var(--background);
}
</style>
