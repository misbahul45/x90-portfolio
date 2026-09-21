-- Add models introduced after the initial migration but never tracked by Prisma
-- migrate. Closes the gap between schema.prisma and the live database.

-- CreateEnum
CREATE TYPE "BriefService" AS ENUM ('AUTOMATION', 'AI_ASSISTANT', 'AGENTIC_SYSTEM', 'WEB', 'MOBILE', 'OTHER');

-- CreateEnum
CREATE TYPE "BriefStatus" AS ENUM ('NEW', 'REVIEWED', 'QUOTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "UploadedFilePurpose" AS ENUM ('RESEARCH_COVER', 'BRIEF_ATTACHMENT', 'TEAM_AVATAR');

-- CreateEnum
CREATE TYPE "BackgroundJobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "BackgroundJobStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable: brief
CREATE TABLE "brief" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "whatsapp" TEXT,
    "service" "BriefService" NOT NULL DEFAULT 'OTHER',
    "budget" TEXT,
    "timeline" TEXT,
    "message" TEXT NOT NULL,
    "documentUrl" TEXT,
    "documentName" TEXT,
    "documentMimeType" TEXT,
    "status" "BriefStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brief_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "brief_status_createdAt_idx" ON "brief"("status", "createdAt");
CREATE INDEX "brief_service_idx" ON "brief"("service");

-- CreateTable: uploaded_file
CREATE TABLE "uploaded_file" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "purpose" "UploadedFilePurpose" NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploaded_file_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "uploaded_file_purpose_createdAt_idx" ON "uploaded_file"("purpose", "createdAt");

-- CreateTable: background_job
CREATE TABLE "background_job" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT,
    "type" "BackgroundJobType" NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "BackgroundJobStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "background_job_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "background_job_slug_key" ON "background_job"("slug");
CREATE INDEX "background_job_status_createdAt_idx" ON "background_job"("status", "createdAt");

-- CreateTable: project_research
CREATE TABLE "project_research" (
    "projectId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "relation" TEXT NOT NULL DEFAULT 'related',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_research_pkey" PRIMARY KEY ("projectId","articleId")
);

CREATE INDEX "project_research_articleId_idx" ON "project_research"("articleId");

-- AddForeignKey: project_research -> project
ALTER TABLE "project_research" ADD CONSTRAINT "project_research_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: project_research -> article
ALTER TABLE "project_research" ADD CONSTRAINT "project_research_articleId_fkey"
    FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
