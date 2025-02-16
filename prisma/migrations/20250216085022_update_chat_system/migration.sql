/*
  Warnings:

  - You are about to drop the column `chatRoomId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `last_reat_at` on the `UserChatRoom` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order_id]` on the table `ChatRoom` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chat_room_id` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatRoomId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "chatRoomId",
ADD COLUMN     "chat_room_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "UserChatRoom" DROP COLUMN "last_reat_at",
ADD COLUMN     "last_read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_order_id_key" ON "ChatRoom"("order_id");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
