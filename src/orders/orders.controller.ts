import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('orders')
@ApiTags('거래')
@ApiResponse({ status: 200, description: '성공' })
@ApiResponse({ status: 401, description: '인증 실패' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {
  }

  @Post()
  @ApiOperation({ summary: '거래 생성', description: '사용자가 책 구매를 위해 거래를 생성합니다.' })
  createOrder(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '거래 생성', description: '사용자가 책 구매를 위해 거래를 생성합니다.' })
  updateOrderStatus(
    @Req() req,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.updateOrderStatus(
      BigInt(id),
      req.user.id,
      updateOrderDto,
    );
  }

  @Get('/buyer')
  @ApiOperation({ summary: '구매 목록 조회', description: '사용자가 구매자로 참여한 거래 목록을 조회합니다.' })
  getBuyerOrders(@Req() req) {
    return this.ordersService.getBuyerOrders(req.user.id);
  }

  @Get('/seller')
  @ApiOperation({ summary: '판매 목록 조회', description: '사용자가 판매자로 등록한 거래 목록을 조회합니다.' })
  getSellerOrders(@Req() req) {
    return this.ordersService.getSellerOrders(req.user.id);
  }
}
