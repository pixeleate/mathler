-- CreateTable
CREATE TABLE "daily_equations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "equation" TEXT NOT NULL,
    "targetNumber" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "equation_pool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equation" TEXT NOT NULL,
    "targetNumber" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_equations_date_key" ON "daily_equations"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_equations_equation_key" ON "daily_equations"("equation");

-- CreateIndex
CREATE UNIQUE INDEX "equation_pool_equation_key" ON "equation_pool"("equation");
