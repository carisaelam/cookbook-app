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
      type="button"
      @click="clearSearch"
    >
      Clear
    </button>
  </div>
</template>

<style scoped>
.search-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 520px;
}

.clear-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  color: var(--text);
}

.clear-btn:hover {
  background-color: var(--primary-light);
}
</style>
