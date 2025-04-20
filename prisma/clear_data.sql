-- 외래 키 제약 무시
SET session_replication_role = replica;

TRUNCATE TABLE
    "Message",
  "UserChatRoom",
  "ChatRoom",
  "Order",
  "Favorite",
  "BookImage",
  "Book",
  "User"
RESTART IDENTITY CASCADE;

-- 다시 제약 설정
SET session_replication_role = origin;