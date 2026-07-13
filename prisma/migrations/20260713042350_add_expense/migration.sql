-- CreateTable
CREATE TABLE "expense" (
    "id" TEXT NOT NULL,
    "expense_date" DATE NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "expense_category_id" TEXT NOT NULL,
    "vendor_name" TEXT,
    "payment_method" TEXT NOT NULL,
    "bill_number" TEXT,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expense_expense_date_idx" ON "expense"("expense_date");

-- CreateIndex
CREATE INDEX "expense_deleted_at_idx" ON "expense"("deleted_at");

-- CreateIndex
CREATE INDEX "expense_amount_idx" ON "expense"("amount");

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_expense_category_id_fkey" FOREIGN KEY ("expense_category_id") REFERENCES "expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
