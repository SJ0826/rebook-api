import { BookStatus, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding users...');

  const users = [
    { name: '김철수', email: 'chulsoo@example.com', password: 'password123' },
    { name: '이영희', email: 'younghee@example.com', password: 'password123' },
    { name: '박민준', email: 'minjun@example.com', password: 'password123' },
    { name: '최수연', email: 'sooyeon@example.com', password: 'password123' },
    { name: '한지원', email: 'jiwon@example.com', password: 'password123' },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: { ...user, password: hashedPassword },
    });
  }

  console.log('✅ User seeding completed.');

  console.log('📚 Seeding books...');

  const books = [
    {
      title: '해리 포터와 마법사의 돌',
      author: 'J.K. 롤링',
      publisher: '문학수첩',
      price: 15000,
      status: BookStatus.NEW, // ✅ ENUM 타입으로 변경
    },
    {
      title: '자바스크립트 완벽 가이드',
      author: 'David Flanagan',
      publisher: '한빛미디어',
      price: 38000,
      status: BookStatus.LIKE_NEW, // ✅ ENUM 타입으로 변경
    },
    {
      title: '나미야 잡화점의 기적',
      author: '히가시노 게이고',
      publisher: '현대문학',
      price: 14000,
      status: BookStatus.GOOD, // ✅ ENUM 타입으로 변경
    },
    {
      title: '데미안',
      author: '헤르만 헤세',
      publisher: '민음사',
      price: 11000,
      status: BookStatus.ACCEPTABLE, // ✅ ENUM 타입으로 변경
    },
    {
      title: '모비딕',
      author: '허먼 멜빌',
      publisher: '열린책들',
      price: 19000,
      status: BookStatus.LIKE_NEW, // ✅ ENUM 타입으로 변경
    },
  ];

  const sellers = await prisma.user.findMany({ take: 5 });

  for (let i = 0; i < books.length; i++) {
    await prisma.book.create({
      data: {
        ...books[i],
        sellerId: sellers[i % sellers.length].id,
      },
    });
  }

  console.log('✅ Book seeding completed.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
