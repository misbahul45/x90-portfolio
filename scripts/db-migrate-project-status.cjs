"use strict";
const dns = require("node:dns");
const { Agent, setGlobalDispatcher } = require("undici");
dns.setDefaultResultOrder("ipv4first");
setGlobalDispatcher(new Agent({ connect: { family: 4 } }));

const fs = require("node:fs");
const path = require("node:path");
const env = fs.readFileSync(path.join(process.cwd(), ".env"), "utf8");
const m = env.match(/DATABASE_URL="([^"]+)"/);
const { neon } = require("@neondatabase/serverless");
const sql = neon(m[1]);

(async () => {
  const statements = [
    `CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED')`,
    `ALTER TABLE "project" ADD COLUMN "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT'`,
    `ALTER TABLE "project" ADD COLUMN "publishedAt" TIMESTAMP(3)`,
    `CREATE INDEX "project_status_publishedAt_idx" ON "project"("status", "publishedAt")`,
  ];
  for (const stmt of statements) {
    try {
      await sql.query(stmt);
      console.log("OK:", stmt.slice(0, 80));
    } catch (e) {
      console.log("FAIL:", stmt.slice(0, 80));
      console.log("  msg:", e.message);
    }
  }
})();
