-- CreateTable
CREATE TABLE "recipe_drafts" (
    "id" SERIAL NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "editor_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recipe_drafts_recipe_id_key" ON "recipe_drafts"("recipe_id");

-- AddForeignKey
ALTER TABLE "recipe_drafts" ADD CONSTRAINT "recipe_drafts_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_drafts" ADD CONSTRAINT "recipe_drafts_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "users_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
