// --- Chat System ---

const CHAT_KEY = 'avalmeos_chat';
const CHAT_MESSAGES_KEY = 'avalmeos_chat_messages';

// Initialize chat
function initChat() {
    const chatWidget = document.getElementById('chat-widget');
    if (chatWidget) {
        chatWidget.classList.add('hidden');
    }
}

// Toggle chat widget
function toggleChat() {
    const chatWidget = document.getElementById('chat-widget');
    const chatButton = document.getElementById('chat-toggle-btn');
    
    if (chatWidget) {
        chatWidget.classList.toggle('hidden');
        if (!chatWidget.classList.contains('hidden')) {
            // Focus on input
            const chatInput = document.getElementById('chat-input');
            if (chatInput) chatInput.focus();
            
            // Load messages
            loadChatMessages();
        }
    }
    
    if (chatButton) {
        chatButton.classList.toggle('hidden');
    }
}

// Send message
function sendChatMessage(message) {
    const user = getCurrentUser();
    if (!message.trim()) return;
    
    const messages = getChatMessages();
    const newMessage = {
        id: 'msg_' + Date.now(),
        text: message.trim(),
        sender: user ? user.name : 'Guest',
        senderId: user ? user.id : null,
        timestamp: new Date().toISOString(),
        isAdmin: false
    };
    
    messages.push(newMessage);
    saveChatMessages(messages);
    
    // Clear input
    const chatInput = document.getElementById('chat-input');
    if (chatInput) chatInput.value = '';
    
    // Render messages
    renderChatMessages();
    
    // Simulate admin response after delay
    setTimeout(() => {
        simulateAdminResponse();
    }, 2000);
}

// Simulate admin response
function simulateAdminResponse() {
    const responses = [
        "Hello! Thank you for contacting Avalmeo's Travel. How can I assist you today?",
        "I'd be happy to help you with your travel inquiry. Could you provide more details?",
        "Our team is here to make your travel experience amazing. What would you like to know?",
        "Thank you for your message! One of our travel consultants will respond shortly.",
        "That's a great question! Let me check the availability for you.",
        "We have amazing packages for that destination. Would you like me to share more details?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const messages = getChatMessages();
    const adminMessage = {
        id: 'msg_' + Date.now(),
        text: randomResponse,
        sender: 'Avalmeos Support',
        senderId: 'admin',
        timestamp: new Date().toISOString(),
        isAdmin: true
    };
    
    messages.push(adminMessage);
    saveChatMessages(messages);
    renderChatMessages();
}

// Get chat messages
function getChatMessages() {
    return JSON.parse(localStorage.getItem(CHAT_MESSAGES_KEY) || '[]');
}

// Save chat messages
function saveChatMessages(messages) {
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
}

// Clear chat messages
function clearChatMessages() {
    localStorage.removeItem(CHAT_MESSAGES_KEY);
}

// Render chat messages
function renderChatMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    const messages = getChatMessages();
    
    container.innerHTML = messages.map(msg => `
        <div class="flex ${msg.isAdmin ? 'justify-start' : 'justify-end'} mb-3">
            <div class="max-w-[80%] ${msg.isAdmin ? 'bg-gray-100' : 'bg-[#1a4d41] text-white'} rounded-2xl px-4 py-2">
                ${msg.isAdmin ? '<div class="text-xs font-bold text-[#1a4d41] mb-1">Avalmeos Support</div>' : ''}
                <div class="text-sm">${escapeHtml(msg.text)}</div>
                <div class="text-xs ${msg.isAdmin ? 'text-gray-500' : 'text-white/70'} mt-1">
                    ${formatChatTime(msg.timestamp)}
                </div>
            </div>
        </div>
    `).join('');
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Load chat messages
function loadChatMessages() {
    renderChatMessages();
}

// Format chat time
function formatChatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Get quick reply options
function getQuickReplies() {
    return [
        { text: 'Check availability', icon: '📅' },
        { text: 'Package details', icon: '📦' },
        { text: 'Pricing', icon: '💰' },
        { text: 'Contact agent', icon: '📞' },
        { text: 'Cancel', icon: '❌' }
    ];
}

// Render quick replies
function renderQuickReplies() {
    const container = document.getElementById('chat-quick-replies');
    if (!container) return;
    
    const quickReplies = getQuickReplies();
    
    container.innerHTML = quickReplies.map(reply => `
        <button onclick="sendQuickReply('${reply.text}')" 
            class="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 flex items-center gap-1">
            <span>${reply.icon}</span>
            <span>${reply.text}</span>
        </button>
    `).join('');
}

// Send quick reply
function sendQuickReply(text) {
    sendChatMessage(text);
}

// Initialize chat system - should be called after components are loaded
window.initChatSystem = function() {
    renderQuickReplies();
    
    // Add enter key listener
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage(chatInput.value);
            }
        });
    }
    
    // Add send button listener
    const sendBtn = document.getElementById('chat-send-btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const input = document.getElementById('chat-input');
            if (input) sendChatMessage(input.value);
        });
    }
}

// For backward compatibility - remove DOMContentLoaded handler
// The initialization is now handled by main.js after components load

// Admin chat functions
function sendAdminMessage(message, recipientId = null) {
    const messages = getChatMessages();
    const adminMessage = {
        id: 'msg_' + Date.now(),
        text: message,
        sender: 'Admin',
        senderId: 'admin',
        timestamp: new Date().toISOString(),
        isAdmin: true,
        recipientId: recipientId
    };
    
    messages.push(adminMessage);
    saveChatMessages(messages);
    renderChatMessages();
}

function getAdminMessages() {
    const messages = getChatMessages();
    return messages.filter(m => m.isAdmin);
}

function getUserMessages() {
    const messages = getChatMessages();
    return messages.filter(m => !m.isAdmin);
}
