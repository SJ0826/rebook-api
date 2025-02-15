import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }

  @Patch(':id')
  updateOrderStatus(
    @Req() req,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.updateOrderStatus(
      Number(id),
      req.user.id,
      updateOrderDto,
    );
  }

  @Get('/buyer')
  getBuyerOrders(@Req() req) {
    return this.ordersService.getBuyerOrders(req.user.id);
  }

  @Get('/seller')
  getSellerOrders(@Req() req) {
    return this.ordersService.getSellerOrders(req.user.id);
  }
}
