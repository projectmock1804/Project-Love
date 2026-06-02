const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function createMaleTestUser() {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test-male@example.com' }
    });

    if (existingUser) {
      console.log('✅ Male test user already exists');
      console.log(existingUser);
      await prisma.$disconnect();
      return;
    }

    const hashedPassword = await bcryptjs.hash('password123', 10);
    const newUser = await prisma.user.create({
      data: {
        email: 'test-male@example.com',
        passwordHash: hashedPassword,
        name: 'Test Male User',
        gender: 'male',
        age: 27,
        region: 'Seoul',
        status: 'active'
      }
    });

    console.log('✅ Male test user created:');
    console.log(newUser);
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
  }
}

createMaleTestUser();
