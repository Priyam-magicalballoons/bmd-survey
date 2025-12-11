-- CreateTable
CREATE TABLE "public"."Coordinator" (
    "id" TEXT NOT NULL,
    "campId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "empId" TEXT,
    "address" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Coordinator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Doctor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mslCode" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "otp" TEXT,
    "ipAddress" TEXT NOT NULL,
    "coordinatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "age" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "coordinatorId" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Questionaire" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "bmdScore" TEXT NOT NULL,
    "Menopause" TEXT,
    "weight" TEXT NOT NULL,
    "height" TEXT NOT NULL,
    "copd" TEXT NOT NULL,
    "copdMedication" TEXT,
    "kneeOsteoarthritis" TEXT NOT NULL,
    "diabetes" TEXT NOT NULL,
    "epilepsy" TEXT NOT NULL,
    "epilepsyMedication" TEXT,
    "hypertension" TEXT NOT NULL,
    "diet" TEXT NOT NULL,
    "smoking" TEXT NOT NULL,
    "tobacco" TEXT NOT NULL,
    "alcohol" TEXT NOT NULL,
    "historyOfFractures" TEXT NOT NULL,
    "fractureAge" TEXT,
    "orthopaedicSurgeriesHistory" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Questionaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."otp" (
    "id" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coordinator_campId_key" ON "public"."Coordinator"("campId");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_number_key" ON "public"."Doctor"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_coordinatorId_key" ON "public"."Doctor"("coordinatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_number_key" ON "public"."Patient"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Questionaire_patientId_key" ON "public"."Questionaire"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "otp_phone_key" ON "public"."otp"("phone");

-- CreateIndex
CREATE INDEX "otp_otp_phone_idx" ON "public"."otp"("otp", "phone");

-- AddForeignKey
ALTER TABLE "public"."Doctor" ADD CONSTRAINT "Doctor_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "public"."Coordinator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Patient" ADD CONSTRAINT "Patient_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "public"."Coordinator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Questionaire" ADD CONSTRAINT "Questionaire_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
