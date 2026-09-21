// Apply Prisma init migration directly via @neondatabase/serverless HTTP.
// Same dispatcher fix as db.ts (force IPv4). Reads the migration SQL,
// splits on statement boundaries, runs each.
"use strict";

const fs = require("node:fs");
const path = require("node:path");

// Force IPv4 globally via undici — same fix as src/db.ts.
const dns = require("node:dns");
const { Agent, setGlobalDispatcher } = require("undici");
dns.setDefaultResultOrder("ipv4first");
setGlobalDispatcher(new Agent({ connect: { family: 4 } }));

const envPath = path.join(process.cwd(), ".env");
const raw = fs.readFileSync(envPath, "utf8");
const match = raw.match(/DATABASE_URL="([^"]+)"/);
if (!match) { console.log("FATAL: no DATABASE_URL"); process.exit(1); }
const url = match[1];
const host = new URL(url.replace(/^postgres/, "https")).host;
console.log("TARGET:", host);

const ns = require("@neondatabase/serverless");
const sql = ns.neon(url);

const migrationPath = path.join(process.cwd(), "prisma/migrations/20260909181712_init/migration.sql");
const migration = fs.readFileSync(migrationPath, "utf8");

// Split on top-level `;` boundaries. Some CREATE TYPE/ENUM statements use
// single quotes — we treat each statement conservatively by scanning for `;`
// at depth 0.
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

const statements = splitStatements(migration);
console.log("STATEMENTS:", statements.length);

(async () => {
  let ok = 0, fail = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.replace(/\s+/g, " ").slice(0, 80);
    try {
      await sql.query(stmt);
      ok++;
      console.log(`[${i + 1}/${statements.length}] OK: ${preview}`);
    } catch (e) {
      fail++;
      console.log(`[${i + 1}/${statements.length}] FAIL: ${preview}`);
      console.log("   msg:", e?.message);
      if (e?.cause?.code) console.log("   cause:", e.cause.code);
      if (e?.code) console.log("   pgcode:", e.code);
    }
  }
  console.log("DONE ok=", ok, "fail=", fail);
  process.exit(fail > 0 ? 1 : 0);
})();
