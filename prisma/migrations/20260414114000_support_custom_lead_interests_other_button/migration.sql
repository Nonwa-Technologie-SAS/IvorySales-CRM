-- DropForeignKey
ALTER TABLE "LeadProductInterest" DROP CONSTRAINT "LeadProductInterest_productId_fkey";

-- DropForeignKey
ALTER TABLE "LeadServiceInterest" DROP CONSTRAINT "LeadServiceInterest_serviceId_fkey";

-- AlterTable
ALTER TABLE "LeadProductInterest"
ADD COLUMN "customName" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "LeadServiceInterest"
ADD COLUMN "customName" TEXT,
ALTER COLUMN "serviceId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LeadProductInterest_leadId_customName_key" ON "LeadProductInterest"("leadId", "customName");

-- CreateIndex
CREATE UNIQUE INDEX "LeadServiceInterest_leadId_customName_key" ON "LeadServiceInterest"("leadId", "customName");

-- AddForeignKey
ALTER TABLE "LeadProductInterest" ADD CONSTRAINT "LeadProductInterest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadServiceInterest" ADD CONSTRAINT "LeadServiceInterest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
