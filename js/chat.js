// --- Chat System ---

const CHAT_KEY = 'avalmeos_chat';
const CHAT_API_BASE = window.API_BASE_URL || (window.location.origin + '/api');

// Enable auto-replies even when API is working (for testing or demo)
const AUTO_REPLY_ENABLED = true;
const AUTO_REPLY_DELAY = 1500; // 1.5 seconds

// Flag to prevent duplicate auto-replies
let lastAutoReplyTime = 0;
const AUTO_REPLY_COOLDOWN = 5000; // 5 seconds cooldown between auto-replies

// Session ID for guests
function getSessionId() {
    let sessionId = sessionStorage.getItem('chat_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('chat_session_id', sessionId);
    }
    return sessionId;
}

// Get current user info
function getCurrentUser() {
    const authData = localStorage.getItem('avalmeos_auth');
    if (authData) {
        try {
            return JSON.parse(authData);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Get or create conversation
let currentConversationId = null;

async function getOrCreateConversation() {
    if (currentConversationId) return currentConversationId;
    
    const user = getCurrentUser();
    const sessionId = getSessionId();
    
    try {
        const response = await fetch(`${CHAT_API_BASE}/chat/conversation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: sessionId,
                user_id: user?.id || null,
                user_name: user?.name || user?.first_name || 'Guest',
                user_email: user?.email || null
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create conversation');
        }
        
        const conversation = await response.json();
        currentConversationId = conversation.id;
        return conversation.id;
    } catch (error) {
        console.error('Error creating conversation:', error);
        // Fallback to localStorage if API fails
        return null;
    }
}

// Initialize chat
function initChat() {
    const chatWidget = document.getElementById('chat-widget');
    if (chatWidget) {
        chatWidget.classList.add('hidden');
    }
}

// Toggle chat widget
async function toggleChat() {
    const chatWidget = document.getElementById('chat-widget');
    const chatButton = document.getElementById('chat-toggle-btn');
    
    if (chatWidget) {
        chatWidget.classList.toggle('hidden');
        if (!chatWidget.classList.contains('hidden')) {
            // Focus on input
            const chatInput = document.getElementById('chat-input');
            if (chatInput) chatInput.focus();
            
            // Load messages
            await loadChatMessages();
        }
    }
    
    if (chatButton) {
        chatButton.classList.toggle('hidden');
    }
}

// Send message
async function sendChatMessage(message) {
    const user = getCurrentUser();
    if (!message.trim()) return;
    
    try {
        // Try to get or create conversation
        const conversationId = await getOrCreateConversation();
        
        if (conversationId) {
            // Send to API
            const response = await fetch(`${CHAT_API_BASE}/chat/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversation_id: conversationId,
                    message_text: message.trim(),
                    sender_name: user?.name || user?.first_name || 'Guest',
                    sender_id: user?.id || null,
                    session_id: getSessionId()
                })
            });
            
            if (response.ok) {
                // Clear localStorage since messages are now in API
                localStorage.removeItem('avalmeos_chat_messages');
                
                // Clear input
                const chatInput = document.getElementById('chat-input');
                if (chatInput) chatInput.value = '';
                
                // Render messages
                await renderChatMessages();
                
                // Trigger auto-reply if enabled (even when API works)
                if (AUTO_REPLY_ENABLED) {
                    setTimeout(() => {
                        triggerAutoResponse(message.trim());
                    }, AUTO_REPLY_DELAY);
                }
                return;
            }
        }
        
        // Fallback to localStorage if API fails
        throw new Error('API unavailable');
    } catch (error) {
        console.warn('Chat API unavailable, using localStorage fallback');
        console.warn('API Error:', error.message);
        
        // Fallback to localStorage
        const messages = JSON.parse(localStorage.getItem('avalmeos_chat_messages') || '[]');
        if (!Array.isArray(messages)) {
            return [];
        }
        
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
        
        // Simulate admin response after delay (pass user's message for keyword matching)
        setTimeout(() => {
            triggerAutoResponse(message.trim());
        }, 2000);
    }
}

// Trigger auto response - only for keyword matches
function triggerAutoResponse(userMessage) {
    // Check cooldown to prevent duplicate auto-replies
    const now = Date.now();
    if (now - lastAutoReplyTime < AUTO_REPLY_COOLDOWN) {
        console.log('[Chat] Auto-reply on cooldown, skipping');
        return;
    }
    
    // Check if message has matching keywords - only auto-reply for keywords
    const lowercaseMessage = userMessage.toLowerCase();
    const keywordList = ['price', 'book', 'reserve', 'destination', 'baguio', 'cebu', 'palawan', 'davao', 'package', 'contact', 'help', 'thank', 'hi', 'hello'];
    const hasKeyword = keywordList.some(keyword => lowercaseMessage.includes(keyword));
    
    // Only auto-reply if keyword matches, otherwise admin needs to respond
    if (!hasKeyword) {
        console.log('[Chat] No keyword match, admin needs to respond manually');
        return;
    }
    
    lastAutoReplyTime = now;
    
    const responseText = getAutoResponse(userMessage);
    
    // Get current conversation ID
    const conversationId = currentConversationId;
    
    if (conversationId) {
        // Save to API (this is the proper way)
        fetch(`${CHAT_API_BASE}/chat/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversation_id: conversationId,
                message_text: responseText,
                sender_name: 'Avalmeos Support',
                sender_id: 'auto_reply',
                sender_type: 'admin'
            })
        }).then(() => {
            // After saving to API, refresh messages
            renderChatMessages();
        }).catch(err => {
            console.log('Auto-reply API error:', err);
            // Fallback to localStorage if API fails
            saveToLocalStorage(responseText);
        });
    } else {
        // No conversation ID, save to localStorage fallback
        saveToLocalStorage(responseText);
    }
}

// Save auto-reply to localStorage
function saveToLocalStorage(responseText) {
    const messages = JSON.parse(localStorage.getItem('avalmeos_chat_messages') || '[]');
    if (!Array.isArray(messages)) {
        return;
    }
    
    const adminMessage = {
        id: 'msg_' + Date.now(),
        text: responseText,
        sender: 'Avalmeos Support',
        senderId: 'admin',
        timestamp: new Date().toISOString(),
        isAdmin: true
    };
    
    messages.push(adminMessage);
    saveChatMessages(messages);
    renderChatMessages();
}

// Simulate admin response (fallback when API unavailable)
function simulateAdminResponse(userMessage = '') {
    // Keyword-based responses
    const keywordResponses = {
        // Price/Pricing related
        'price': [
            "Our tour packages range from ₱2,000 to ₱15,000 depending on the destination and inclusions. Would you like me to send you our latest price list?",
            "Great question about pricing! We have options for every budget. Can you tell me which destination you're interested in?"
        ],
        // Booking related
        'book': [
            "I'd be happy to help you book! You can book directly through our website or I can connect you with one of our travel agents.",
            "To book, you'll need to select your preferred package and date. Would you like me to show you available packages?"
        ],
        'reserve': [
            "We'd be happy to reserve your spot! Please provide your preferred date and number of guests.",
            "For reservations, we need your desired travel date and number of people. Shall I check availability for you?"
        ],
        // Destination related
        'destination': [
            "We have amazing destinations across the Philippines! Popular choices include Baguio, Cebu, Palawan, and Davao. Which area interests you?",
            "We offer tours to many beautiful destinations. Are you looking for beach, mountain, or city tours?"
        ],
        'baguio': [
            "Baguio is a great choice! We have packages that include city tours, strawberry picking, and mountain view hotels. Would you like more details?",
            "Baguio tours are available year-round. The Panagbenga Festival is especially popular. Interested in a specific date?"
        ],
        'cebu': [
            "Cebu offers amazing beaches and dive spots! We have tours from whale shark swimming to city explorations. What interests you most?",
            "Cebu is wonderful! We can arrange Oslob whale shark tours, beach resorts, and city tours. Your preference?"
        ],
        'palawan': [
            "Palawan is paradise! Our packages include Puerto Princesa Underground River and El Nido island hopping. Which one interests you?",
            "Palawan tours are highly rated! We have options for Puerto Princesa, El Nido, and Coron. Budget in mind?"
        ],
        'davao': [
            "Davao offers a unique blend of nature and adventure! Popular spots include Mt. Apo, Malagos Garden, and island tours. What appeals to you?",
            "Davao tours include city exploration, nature trips, and beach getaways. How many days are you planning?"
        ],
        // Package related
        'package': [
            "We have various packages available - day tours, overnight stays, and multi-day trips. What's your preferred duration?",
            "Our packages include transportation, guide, and sometimes meals. Would you like me to send you our package list?"
        ],
        // Contact related
        'contact': [
            "You can reach us at our hotline or through this chat. Our agents are available 24/7 to assist you!",
            "For direct assistance, you can call our office or continue chatting here. How can I help you further?"
        ],
        // Help
        'help': [
            "I can help you with: booking information, package details, pricing, and travel recommendations. What would you like to know?",
            "I'm here to help! Ask me about destinations, prices, bookings, or any travel-related questions."
        ],
        // Thank you
        'thank': [
            "You're welcome! Is there anything else I can help you with?",
            "My pleasure! Feel free to ask if you have more questions."
        ],
        // Hello/Hi
        'hi': [
            "Hello! Welcome to Avalmeo's Travel. How can I assist you today?",
            "Hi there! Looking forward to helping you plan your next adventure!",
            "Hello! Thank you for contacting Avalmeo's Travel. How can I assist you today?"
        ],
        'hello': [
            "Hello! Welcome to Avalmeo's Travel. How can I assist you today?",
            "Hi there! Looking forward to helping you plan your next adventure!"
        ]
    };
    
    // Default responses
    const defaultResponses = [
        "Thank you for your message! One of our travel consultants will respond shortly.",
        "That's a great question! Let me check the availability for you.",
        "We have amazing packages for that destination. Would you like me to share more details?",
        "I'd be happy to help you with your travel inquiry. Could you provide more details?",
        "Our team is here to make your travel experience amazing. What would you like to know?"
    ];
    
    // Check for keywords in user message
    const lowercaseMessage = userMessage.toLowerCase();
    
    for (const [keyword, responses] of Object.entries(keywordResponses)) {
        if (lowercaseMessage.includes(keyword)) {
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            return randomResponse;
        }
    }
    
    // Return random default response if no keywords matched
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Get auto response (for fallback mode)
function getAutoResponse(userMessage = '') {
    return simulateAdminResponse(userMessage);
}

// Get chat messages from API or localStorage
async function getChatMessages() {
    try {
        const conversationId = await getOrCreateConversation();
        
        if (conversationId) {
            const response = await fetch(`${CHAT_API_BASE}/chat/conversations/${conversationId}/messages`);
            
            if (response.ok) {
                const apiMessages = await response.json();
                const mappedApiMessages = apiMessages.map(msg => ({
                    id: msg.id,
                    text: msg.message_text,
                    sender: msg.sender_name,
                    senderId: msg.sender_id,
                    timestamp: msg.created_at,
                    // Check multiple conditions to determine if admin
                    isAdmin: msg.sender_type === 'admin' || 
                            msg.sender_name?.toLowerCase().includes('support') ||
                            msg.sender_name?.toLowerCase().includes('admin') ||
                            msg.sender_id === 'auto_reply'
                }));
                
                // Sort by timestamp ascending (chronological order)
                mappedApiMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                
                return mappedApiMessages;
            }
        }
        
        throw new Error('API unavailable');
    } catch (error) {
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('avalmeos_chat_messages') || '[]');
    }
}

// Save chat messages (localStorage fallback)
function saveChatMessages(messages) {
    localStorage.setItem('avalmeos_chat_messages', JSON.stringify(messages));
}

// Clear chat messages
function clearChatMessages() {
    localStorage.removeItem('avalmeos_chat_messages');
}

// Render chat messages
async function renderChatMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    const messages = await getChatMessages();
    
    container.innerHTML = messages.map(msg => `
        <div class="flex ${msg.isAdmin ? 'justify-start' : 'justify-end'} mb-3">
            <div class="max-w-[80%] ${msg.isAdmin ? 'bg-gray-100' : 'bg-[#1a4d41] text-white'} rounded-2xl px-4 py-2">
                ${msg.isAdmin ? `<div class="text-xs font-bold text-[#1a4d41] mb-1">${escapeHtml(msg.sender)}</div>` : ''}
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
async function loadChatMessages() {
    await renderChatMessages();
    
    // Also poll for new messages periodically when chat is open
    startMessagePolling();
}

// Polling interval for checking new messages
let messagePollingInterval = null;

function startMessagePolling() {
    if (messagePollingInterval) return;
    
    messagePollingInterval = setInterval(async () => {
        const chatWidget = document.getElementById('chat-widget');
        if (chatWidget && !chatWidget.classList.contains('hidden')) {
            await renderChatMessages();
        }
    }, 10000); // Poll every 10 seconds
}

function stopMessagePolling() {
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
        messagePollingInterval = null;
    }
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
    
    // Also start polling in background for notifications
    startMessagePolling();
};

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopMessagePolling();
});

// Make functions available globally
window.toggleChat = toggleChat;
window.sendChatMessage = sendChatMessage;
window.sendQuickReply = sendQuickReply;
window.loadChatMessages = loadChatMessages;
window.renderChatMessages = renderChatMessages;
window.triggerAutoResponse = triggerAutoResponse;
window.getAutoResponse = getAutoResponse;
