import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * 거래 요청 (주문 생성)
   */
  async createOrder(buyerId: number, createOrderDto: CreateOrderDto) {
    const { bookId } = createOrderDto;

    // 1. 거래 요청에 해당하는 책 확인
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('해당 책을 찾을 수 없습니다.');

    // 2. 구매자와 판매자가 동일하면 거래를 생성할 수 없음.
    if (BigInt(book.sellerId) === BigInt(buyerId))
      throw new ForbiddenException('본인의 책을 구매할 수 없습니다.');

    // 3. 거래 생성
    const order = this.prisma.order.create({
      data: {
        bookId,
        buyerId,
        sellerId: book.sellerId,
      },
    });

    // 4. 채팅방 생성
    await this.prisma.chatRoom.create({
      data: {
        orderId: (await order).id,
      },
    });

    return order;
  }

  /**
   * 거래 상태 변경 (판매자가 승인/취소 가능)
   */
  async updateOrderStatus(
    orderId: number,
    sellerId: number,
    updateOrderDto: UpdateOrderDto,
  ) {
    const { status } = updateOrderDto;

    // 주문 존재 여부 확인
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('해당 주문을 찾을 수 없습니다.');

    // 판매자만 거래 상태 변경 가능
    if (BigInt(order.sellerId) !== BigInt(sellerId)) {
      throw new ForbiddenException('이 주문을 변경할 권한이 없습니다.');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  /**
   * 구매 내역 조회
   */
  async getBuyerOrders(buyerId: number) {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: { book: true },
    });
  }

  /**
   * 판매 내역 조회
   */
  async getSellerOrders(sellerId: number) {
    return this.prisma.order.findMany({
      where: { sellerId },
      include: { book: true },
    });
  }
}
