import { ref } from 'vue'

const isVisible = ref(false)
const message = ref('')

export const useToast = () => {
  const showToast = (msg: string, duration = 3000) => {
    message.value = msg
    isVisible.value = true
    setTimeout(() => {
      isVisible.value = false
    }, duration)
  }

  return {
    isVisible,
    message,
    showToast
  }
}
