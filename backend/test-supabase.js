// Simple API key verification test
require('dotenv').config({ path: __dirname + '/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('=== Supabase API Key Verification ===\n');
console.log('URL:', supabaseUrl);
console.log('Key (first 20 chars):', serviceKey?.substring(0, 20) + '...');
console.log('Key length:', serviceKey?.length);

async function verifyKey() {
  // Test with the /rest/v1 endpoint - should work even without tables
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`
    }
  });

  console.log('\nResponse status:', res.status);
  console.log('Response headers:');
  res.headers.forEach((val, key) => console.log(`  ${key}: ${val}`));
  
  const text = await res.text();
  console.log('\nResponse body (first 500 chars):');
  console.log(text.substring(0, 500));
  
  if (res.status === 401) {
    console.log('\n❌ 401 Unauthorized - API key is invalid or expired!');
    console.log('   Check your Supabase project settings.');
  } else if (res.status === 200) {
    console.log('\n✅ API key is valid!');
  }
}

verifyKey();
