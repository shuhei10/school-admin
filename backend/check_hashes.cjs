const bcrypt = require('bcrypt');

async function check() {
  const pass = 'pass1234';
  const hashes = [
    '$2b$10$Kj8y3zkxmPlOj7WAlgCu4eXGa6FiG5dTjt4rFRM9egEyEoy8.Kh8y', // Admin
    '$2b$10$zcgg.rA/9vGBJA3ek2vbvuf04zXDtRS2t0n/LZ5XlMhXhSZVbZvDq', // suzki
    '$2b$10$ZCJk7sXrlDni7HsqhvCznOxdKK4ZyicKNvaMLLstnwTILR9cHLmbi'  // tanaka
  ];

  for (const hash of hashes) {
    const ok = await bcrypt.compare(pass, hash);
    console.log(`Hash: ${hash} -> Match: ${ok}`);
  }
}

check();
