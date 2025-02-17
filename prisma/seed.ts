import { BookStatus, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding users...');

  // ✅ 10명의 사용자 생성
  const users = await Promise.all(
    Array.from({ length: 10 }).map(async (_, i) => {
      return prisma.user.create({
        data: {
          email: `user${i + 1}@example.com`,
          password: await bcrypt.hash('password123', 10),
          name: `User${i + 1}`,
        },
      });
    }),
  );

  console.log('✅ Users seeded!');

  console.log('🚀 Seeding books...');

  // ✅ 50권의 책 생성
  const books = await Promise.all(
    Array.from({ length: 50 }).map((_, i) => {
      return prisma.book.create({
        data: {
          title: `테스트 도서 ${i + 1}`,
          author: `저자 ${i + 1}`,
          publisher: `출판사 ${i + 1}`,
          price: (Math.random() * 50).toFixed(2), // 0~50달러 랜덤 가격
          status: ['NEW', 'LIKE_NEW', 'GOOD', 'ACCEPTABLE'][Math.floor(Math.random() * 4)] as BookStatus,
          sellerId: users[Math.floor(Math.random() * users.length)].id, // 랜덤 판매자 선택
        },
      });
    }),
  );

  console.log('✅ Books seeded!');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });