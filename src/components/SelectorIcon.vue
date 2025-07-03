<template>
  <div class="audio-selector">
    <button
      v-for="option in options"
      :key="option.value"
      :class="['audio-option', { active: modelValue === option.value }]"
      :disabled="option.disabled"
      @click="handleSelect(option.value)"
    >
      <div class="option-icon">
        <component :is="getIconComponent(option.icon)" />
      </div>
      <span class="option-text">{{ option.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    default: () => [
      { value: 'origin', label: '原曲', icon: 'music', disabled: false },
      { value: 'vocal', label: '人声', icon: 'microphone', disabled: false },
      { value: 'acc', label: '伴奏', icon: 'instrument', disabled: false }
    ]
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'change'])

// Methods
const handleSelect = (value) => {
  if (props.modelValue !== value) {
    emit('update:modelValue', value)
    emit('change', value)
  }
}

const getIconComponent = (iconName) => {
  const icons = {
    music: 'IconMusic',
    microphone: 'IconMicrophone', 
    instrument: 'IconInstrument'
  }
  return icons[iconName] || 'IconMusic'
}
</script>

<script>
// 图标组件定义
const IconMusic = {
  template: `
    <svg viewBox="0 0 24 24" class="icon">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  `
}

const IconMicrophone = {
  template: `
    <svg viewBox="0 0 24 24" class="icon">
      <path d="M12 2c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2s2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      <path d="M19 10v2c0 3.87-3.13 7-7 7s-7-3.13-7-7v-2h2v2c0 2.76 2.24 5 5 5s5-2.24 5-5v-2h2z"/>
      <path d="M10 21h4v2h-4z"/>
    </svg>
  `
}

const IconInstrument = {
  template: `
    <svg viewBox="0 0 24 24" class="icon">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM7 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm10 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    </svg>
  `
}

export default {
  components: {
    IconMusic,
    IconMicrophone,
    IconInstrument
  }
}
</script>

<style scoped>
.audio-selector {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px;
  border-radius: 12px;
  width: 100%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.audio-option {
  flex: 1;
  position: relative;
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 6px 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-family: inherit;
  overflow: hidden;
  min-height: 44px;
}

.audio-option:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.audio-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.audio-option:hover::before {
  opacity: 0.1;
}

.audio-option.active::before {
  opacity: 1;
}

.audio-option.active {
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.audio-option:not(.active):hover {
  background: rgba(102, 126, 234, 0.08);
}

.option-icon {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.icon {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.option-text {
  font-size: 16px;
  font-weight: 600;
  position: relative;
  padding-bottom: 16%;
  z-index: 1;
  color: #64748b;
  transition: color 0.3s ease;
  line-height: 1;
}

.audio-option.active .option-text {
  color: white;
}

.audio-option:hover .option-text {
  color: #475569;
}

.audio-option.active:hover .option-text {
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .audio-option {
    padding: 6px 6px;
    min-height: 40px;
  }
  
  .option-text {
    font-size: 11px;
  }
  
  .icon {
    width: 12px;
    height: 12px;
  }
  
  .option-icon {
    width: 16px;
    height: 16px;
  }
}
</style>