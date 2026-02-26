-- =====================================================
-- CHAT TABLES MIGRATION
-- Run this file to add chat functionality to existing database
-- =====================================================

-- =====================================================
-- CHAT CONVERSATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    user_name TEXT,
    user_email TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CHAT MESSAGES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
    sender_name TEXT NOT NULL,
    sender_id TEXT,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR CHAT PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message ON chat_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE chat_conversations IS 'Chat conversations between users and admins';
COMMENT ON TABLE chat_messages IS 'Individual messages in chat conversations';

-- =====================================================
-- RLS POLICIES (if using Supabase)
-- =====================================================

-- Allow users to create conversations
CREATE POLICY "Users can create conversations" ON chat_conversations
    FOR INSERT WITH CHECK (true);

-- Allow users to read their own conversations
CREATE POLICY "Users can read own conversations" ON chat_conversations
    FOR SELECT USING (true);

-- Allow users to update their own conversations
CREATE POLICY "Users can update own conversations" ON chat_conversations
    FOR UPDATE USING (true);

-- Allow anyone to read messages (for real-time sync)
CREATE POLICY "Anyone can read messages" ON chat_messages
    FOR SELECT USING (true);

-- Allow anyone to insert messages
CREATE POLICY "Anyone can insert messages" ON chat_messages
    FOR INSERT WITH CHECK (true);

-- Admin full access to conversations
CREATE POLICY "Admins full access to conversations" ON chat_conversations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Admin full access to messages
CREATE POLICY "Admins full access to messages" ON chat_messages
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
