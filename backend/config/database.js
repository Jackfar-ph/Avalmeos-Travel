const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_SERVICE_KEY:', supabaseKey ? '***SET***' : 'NOT SET');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
