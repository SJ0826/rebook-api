/*
  Warnings:

  - A unique constraint covering the columns `[user_id,chat_room_id]` on the table `UserChatRoom` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserChatRoom_user_id_chat_room_id_key" ON "UserChatRoom"("user_id", "chat_room_id");
