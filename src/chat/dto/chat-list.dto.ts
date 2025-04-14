import { ApiProperty } from '@nestjs/swagger';

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
    example: 'https://image.url/book.jpg',
    description: '책 대표 이미지 URL',
    nullable: true,
  })
  bookImage: string | null;

  @ApiProperty({ example: 3, description: '읽지 않은 메시지 개수' })
  unreadCount: number;
}
