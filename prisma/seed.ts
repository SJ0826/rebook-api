import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 👤 유저 2명 생성
  const hashedPw1 = await bcrypt.hash('1234', 10); // 김유저 비밀번호
  const hashedPw2 = await bcrypt.hash('5678', 10); // 이상대 비밀번호

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      password: hashedPw1,
      name: '김유저',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      password: hashedPw2,
      name: '이상대',
    },
  });
  // 📚 책 등록 (user1이 판매자)
  const book = await prisma.book.create({
    data: {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      publisher: '인사이트',
      price: 15000,
      description: '코드를 깔끔하게 작성하는 법',
      sellerId: user1.id,
      bookImage: {
        create: [
          {
            imageUrl: 'https://example.com/book1.jpg',
            uuid: 'book-image-uuid-1',
          },
        ],
      },
    },
  });

  // 📦 주문 생성 (user2가 구매자)
  const order = await prisma.order.create({
    data: {
      bookId: book.id,
      buyerId: user2.id,
      sellerId: user1.id,
    },
  });

  // 💬 채팅방 생성 (주문 1:1 매핑)
  const chatRoom = await prisma.chatRoom.create({
    data: {
      orderId: order.id,
    },
  });

  // 👥 참여자 매핑
  await prisma.userChatRoom.createMany({
    data: [
      {
        userId: user1.id,
        chatRoomId: chatRoom.id,
        lastReadAt: new Date(Date.now() - 1000 * 60 * 5), // 5분 전
      },
      {
        userId: user2.id,
        chatRoomId: chatRoom.id,
        lastReadAt: new Date(Date.now() - 1000 * 60 * 1), // 1분 전
      },
    ],
  });

  // 📨 메시지들 (1명은 이미 읽은 시점, 1명은 아직 안 읽음)
  await prisma.message.createMany({
    data: [
      {
        senderId: user2.id,
        chatRoomId: chatRoom.id,
        content: '안녕하세요. 책 구매하고 싶어요.',
        createdAt: new Date(Date.now() - 1000 * 60 * 4), // 4분 전
      },
      {
        senderId: user1.id,
        chatRoomId: chatRoom.id,
        content: '네 가능합니다!',
        createdAt: new Date(Date.now() - 1000 * 60 * 2), // 2분 전
      },
      {
        senderId: user2.id,
        chatRoomId: chatRoom.id,
        content: '언제 거래 가능하신가요?',
        createdAt: new Date(Date.now() - 1000 * 10), // 10초 전
      },
    ],
  });

  console.log('✅ Seed completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
