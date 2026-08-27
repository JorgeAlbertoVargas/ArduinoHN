<template>
  <div class="chatbot-container">
    <!-- Chat Button -->
    <button v-if="!isOpen" class="chat-btn" @click="isOpen = true">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    </button>

    <!-- Chat Window -->
    <div v-if="isOpen" class="chat-window glass">
      <div class="chat-header">
        <div class="chat-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <span>Asistente ArduinoHN</span>
        </div>
        <button class="close-btn" @click="isOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
          <div class="bubble">{{ msg.text }}</div>
        </div>
        <div v-if="isTyping" class="message assistant">
          <div class="bubble typing">...</div>
        </div>
      </div>
      
      <div class="chat-input">
        <input 
          v-model="inputMsg" 
          @keyup.enter="sendMessage"
          type="text" 
          placeholder="Escribe tu duda..." 
        />
        <button @click="sendMessage" :disabled="!inputMsg.trim() || isTyping">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

const isOpen = ref(false);
const inputMsg = ref('');
const isTyping = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const messages = ref([
  { role: 'assistant', text: '¡Hola! Bienvenido a ArduinoHN. ¿En qué puedo ayudarte hoy? 🤖' }
]);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const sendMessage = () => {
  if (!inputMsg.value.trim() || isTyping.value) return;
  
  const userText = inputMsg.value.trim();
  messages.value.push({ role: 'user', text: userText });
  inputMsg.value = '';
  scrollToBottom();
  
  isTyping.value = true;
  
  // Mock AI response
  setTimeout(() => {
    isTyping.value = false;
    let reply = 'Interesante pregunta. Pronto podré responderte con la ayuda de mi IA real.';
    
    if (userText.toLowerCase().includes('precio') || userText.toLowerCase().includes('cuesta')) {
      reply = 'Los precios están mostrados en HNL (Lempiras) en la tienda. Si no ves el precio de un producto, consulta nuestra disponibilidad.';
    } else if (userText.toLowerCase().includes('envío') || userText.toLowerCase().includes('entrega')) {
      reply = 'Hacemos envíos a todo el país. Los tiempos dependen del producto (si es stock local o bajo pedido internacional).';
    }
    
    messages.value.push({ role: 'assistant', text: reply });
    scrollToBottom();
  }, 1500);
};
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
}
.chat-btn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}
.chat-btn:hover {
  transform: scale(1.1);
}

.chat-window {
  width: 350px;
  height: 500px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--glass-border);
}

.chat-header {
  background-color: var(--color-primary);
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}
.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

.chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #f9f9fc;
}

.message {
  display: flex;
  max-width: 80%;
}
.message.user {
  align-self: flex-end;
}
.message.assistant {
  align-self: flex-start;
}

.bubble {
  padding: 10px 15px;
  border-radius: 15px;
  font-size: 0.95rem;
  line-height: 1.4;
}
.user .bubble {
  background-color: var(--color-primary);
  color: white;
  border-bottom-right-radius: 5px;
}
.assistant .bubble {
  background-color: #e6e6e6;
  color: #333;
  border-bottom-left-radius: 5px;
}
.typing {
  font-weight: bold;
  letter-spacing: 2px;
}

.chat-input {
  display: flex;
  padding: 15px;
  border-top: 1px solid #eaeaea;
  background: white;
}
.chat-input input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  font-size: 0.95rem;
}
.chat-input input:focus {
  border-color: var(--color-primary);
}
.chat-input button {
  background: none;
  border: none;
  color: var(--color-primary);
  margin-left: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.chat-input button:disabled {
  color: #ccc;
  cursor: not-allowed;
}
</style>
