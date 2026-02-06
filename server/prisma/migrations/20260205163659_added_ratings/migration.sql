-- CreateTable
CREATE TABLE "ratings" (
    "recipe_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("recipe_id","user_id")
);

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
