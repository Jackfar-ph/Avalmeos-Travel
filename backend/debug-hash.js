const bcrypt = require('bcryptjs');

const storedHash = '$2a$10$2otv/VmI7v8tI59nwSDUp.dUea7FF9uAQxK8GgzsLcGf7qtgAgBKm';

const testPasswords = [
  'admin123',
  'admin',
  'password',
  'Admin123!',
  'admin@avalmeo.com',
  'test123',
  '123456'
];

async function test() {
  console.log('Stored hash:', storedHash);
  console.log('\nTesting passwords...\n');
  
  for (const pwd of testPasswords) {
    const match = await bcrypt.compare(pwd, storedHash);
    console.log(`"${pwd}" => ${match ? 'MATCH!' : 'no match'}`);
  }
}

test();
