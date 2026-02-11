// Test bcrypt hash comparison in backend
const bcrypt = require('bcryptjs');

const storedHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

async function test() {
  console.log('Testing hash comparison with bcryptjs:');
  console.log('Stored hash:', storedHash);

  const passwords = ['admin123', 'admin', 'Admin123!'];
  for (const pwd of passwords) {
    const match = await bcrypt.compare(pwd, storedHash);
    console.log(`"${pwd}" => ${match ? 'MATCH!' : 'no match'}`);
  }
}

test();
