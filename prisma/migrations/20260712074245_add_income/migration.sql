-- CreateTable
CREATE TABLE "income" (
    "id" TEXT NOT NULL,
    "transaction_date" DATE NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "income_category_id" TEXT NOT NULL,
    "income_source" TEXT,
    "client_name" TEXT,
    "payment_method" TEXT NOT NULL,
    "reference_number" TEXT,
    "invoice_number" TEXT,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "income_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "income_transaction_date_idx" ON "income"("transaction_date");

-- CreateIndex
CREATE INDEX "income_deleted_at_idx" ON "income"("deleted_at");

-- CreateIndex
CREATE INDEX "income_amount_idx" ON "income"("amount");

-- AddForeignKey
ALTER TABLE "income" ADD CONSTRAINT "income_income_category_id_fkey" FOREIGN KEY ("income_category_id") REFERENCES "income_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
