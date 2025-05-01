// dto/book-summary.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class BookSummaryDto {
  @ApiProperty({ example: 42 })
  id: bigint;

  @ApiProperty({ example: '나미야 잡화점의 기적' })
  title: string;

  @ApiProperty({ example: 9500 })
  price: bigint;

  @ApiProperty({ example: 'FOR_SALE', description: '판매 상태' })
  saleStatus: 'FOR_SALE' | 'RESERVED' | 'SOLD';

  @ApiProperty({
    example: 'https://rebook.s3.amazonaws.com/image.jpg',
    description: '책 썸네일 이미지 (첫 장)',
    nullable: true,
  })
  thumbnail?: string;
}

export class ChatListOpponentDto {
  @ApiProperty({ example: 2, description: '상대방 유저의 ID' })
  userId: number;

  @ApiProperty({ example: '홍길동', description: '상대방 유저의 이름' })
  name: string;

  @ApiProperty({
    example: 'https://image.url/profile.jpg',
    description: '상대방 유저의 프로필 이미지 URL',
    nullable: true,
  })
  imageUrl: string | null;
}

export class ChatListItemDto {
  @ApiProperty({ example: 5, description: '채팅방 ID' })
  chatRoomId: number;

  @ApiProperty({
    example: '책 아직 구매 가능할까요?',
    description: '채팅방의 마지막 메시지',
    nullable: true,
  })
  lastMessage: string | null;

  @ApiProperty({
    example: '2025-04-14T10:00:00.000Z',
    description: '마지막 메시지의 전송 시간',
    nullable: true,
  })
  lastMessageTime: Date | null;

  @ApiProperty({
    type: ChatListOpponentDto,
    description: '상대방 유저 정보',
    nullable: true,
  })
  opponent: ChatListOpponentDto | null;

  @ApiProperty({
    description: '책 정보',
    nullable: true,
  })
  book: BookSummaryDto;

  @ApiProperty({ example: 3, description: '읽지 않은 메시지 개수' })
  unreadCount: number;
}
