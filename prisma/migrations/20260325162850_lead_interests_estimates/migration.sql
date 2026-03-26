-- CreateTable
CREATE TABLE "LeadProductInterest" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "estimatedValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadProductInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadServiceInterest" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "estimatedValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadServiceInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadProductInterest_leadId_productId_key" ON "LeadProductInterest"("leadId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadServiceInterest_leadId_serviceId_key" ON "LeadServiceInterest"("leadId", "serviceId");

-- AddForeignKey
ALTER TABLE "LeadProductInterest" ADD CONSTRAINT "LeadProductInterest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadProductInterest" ADD CONSTRAINT "LeadProductInterest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadServiceInterest" ADD CONSTRAINT "LeadServiceInterest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadServiceInterest" ADD CONSTRAINT "LeadServiceInterest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
