-- CreateTable
CREATE TABLE "BookImage" (
    "id" BIGSERIAL NOT NULL,
    "book_id" BIGINT,
    "image_url" VARCHAR(255) NOT NULL,
    "uuid" VARCHAR NOT NULL,

    CONSTRAINT "BookImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookImage_id_key" ON "BookImage"("id");

-- AddForeignKey
ALTER TABLE "BookImage" ADD CONSTRAINT "BookImage_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;
