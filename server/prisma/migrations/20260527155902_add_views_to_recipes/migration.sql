-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "popularity_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "recipe_views" (
    "id" SERIAL NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "viewer_key" TEXT NOT NULL,
    "last_viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recipe_views_recipe_id_viewer_key_key" ON "recipe_views"("recipe_id", "viewer_key");

-- AddForeignKey
ALTER TABLE "recipe_views" ADD CONSTRAINT "recipe_views_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
