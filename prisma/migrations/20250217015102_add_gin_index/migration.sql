CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX "Book_title_idx" ON "Book" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Book_author_idx" ON "Book" USING GIN ("author" gin_trgm_ops);
