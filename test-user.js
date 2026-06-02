const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test-celebrity@example.com' }
    });

    if (existingUser) {
      console.log('✅ Test user already exists');
      console.log(existingUser);
      return;
    }

    const hashedPassword = await bcryptjs.hash('password123', 10);
    const newUser = await prisma.user.create({
      data: {
        email: 'test-celebrity@example.com',
        password_hash: hashedPassword,
        name: 'Test User',
        gender: 'male',
        age: 25,
        region: 'Seoul',
        status: 'active'
      }
    });

    console.log('✅ Test user created:');
    console.log(newUser);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
