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

const migration = fs.readFileSync(
  path.join(process.cwd(), "prisma/migrations/20260920213624_add_research_brief_files/migration.sql"),
  "utf8",
);

// Naive split — same approach as the earlier migrate-apply script.
function splitStatements(src) {
  const out = [];
  let buf = "";
  let inSingle = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === "'") inSingle = !inSingle;
    if (ch === ";" && !inSingle) {
      const s = buf.trim();
      if (s.length > 0) out.push(s);
      buf = "";
    } else {
      buf += ch;
    }
  }
  const tail = buf.trim();
  if (tail.length > 0) out.push(tail);
  return out;
}

(async () => {
  let ok = 0, fail = 0;
  for (const stmt of splitStatements(migration)) {
    const preview = stmt.replace(/\s+/g, " ").slice(0, 80);
    try {
      await sql.query(stmt);
      ok++;
      console.log("OK:", preview);
    } catch (e) {
      // Ignore "already exists" — Prisma migrate deploy will re-run idempotently
      const code = e?.code || e?.message;
      if (typeof code === "string" && /already exists|42710|42P07/.test(code)) {
        ok++;
        console.log("SKIP:", preview, `(${code})`);
      } else {
        fail++;
        console.log("FAIL:", preview);
        console.log("  msg:", e?.message);
      }
    }
  }
  console.log("DONE ok=", ok, "fail=", fail);
  process.exit(fail > 0 ? 1 : 0);
})();
