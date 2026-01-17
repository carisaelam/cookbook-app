<script setup>
import BaseModal from './BaseModal.vue'

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Confirm'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  isDestructive: {
    type: Boolean,
    default: false
  }
})

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <BaseModal :is-open="isOpen" :title="title" @close="$emit('cancel')">
    <div class="confirm-content">
      <p class="confirm-message">{{ message }}</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary" @click="$emit('cancel')">
          {{ cancelText }}
        </button>
        <button
          :class="['btn', isDestructive ? 'btn-danger' : 'btn-primary']"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.confirm-content {
  text-align: center;
}

.confirm-message {
  margin-bottom: 1.5rem;
  color: var(--text);
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}
</style>
