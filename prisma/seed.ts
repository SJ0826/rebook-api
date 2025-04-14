import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      password: 'hashed_pw_1',
      name: '판매자',
      emailVerified: true,
      isActive: true,
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      email: 'buyer@example.com',
      password: 'hashed_pw_2',
      name: '구매자',
      emailVerified: true,
      isActive: true,
    },
  });

  const book = await prisma.book.create({
    data: {
      title: '자바의 정석',
      author: '남궁성',
      publisher: '도우출판',
      price: 20000,
      status: 'GOOD',
      description: '중고책입니다',
      sellerId: seller.id,
    },
  });

  const order = await prisma.order.create({
    data: {
      bookId: book.id,
      buyerId: buyer.id,
      sellerId: seller.id,
    },
  });

  const chatRoom = await prisma.chatRoom.create({
    data: {
      orderId: order.id,
    },
  });

  await prisma.userChatRoom.createMany({
    data: [
      {
        userId: seller.id,
        chatRoomId: chatRoom.id,
      },
      {
        userId: buyer.id,
        chatRoomId: chatRoom.id,
      },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        senderId: buyer.id,
        chatRoomId: chatRoom.id,
        content: '안녕하세요, 구매하고 싶어요!',
      },
      {
        senderId: seller.id,
        chatRoomId: chatRoom.id,
        content: '네, 가능합니다. 언제 만나실 수 있나요?',
      },
    ],
  });

  console.log('✅ 더미 데이터 삽입 완료!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
