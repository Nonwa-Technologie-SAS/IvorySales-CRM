-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "activityDomain" TEXT,
ADD COLUMN     "civility" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "source" TEXT;

-- CreateTable
CREATE TABLE "ClientProductInterest" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "estimatedValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientProductInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientServiceInterest" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "estimatedValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientServiceInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientProductInterest_clientId_productId_key" ON "ClientProductInterest"("clientId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientServiceInterest_clientId_serviceId_key" ON "ClientServiceInterest"("clientId", "serviceId");

-- AddForeignKey
ALTER TABLE "ClientProductInterest" ADD CONSTRAINT "ClientProductInterest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProductInterest" ADD CONSTRAINT "ClientProductInterest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientServiceInterest" ADD CONSTRAINT "ClientServiceInterest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientServiceInterest" ADD CONSTRAINT "ClientServiceInterest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
