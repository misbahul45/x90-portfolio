// Diagnostic probe — exercises the same Neon HTTP gateway path used by
// @prisma/adapter-neon's PrismaNeonHttp. Outputs ONLY the host being probed
// and result code/messages — never the connection string or any part of it.
"use strict";

const dns = require("node:dns");
const { Agent, setGlobalDispatcher } = require("undici");
dns.setDefaultResultOrder("ipv4first");
setGlobalDispatcher(new Agent({ connect: { family: 4 } }));

const fs = require("node:fs");
const path = require("node:path");
const envPath = path.join(process.cwd(), ".env");
const raw = fs.readFileSync(envPath, "utf8");
const match = raw.match(/DATABASE_URL="([^"]+)"/);
if (!match) {
  console.log("FATAL: no DATABASE_URL in .env");
  process.exit(1);
}
const url = match[1];
const host = new URL(url.replace(/^postgres/, "https")).host;
console.log("HOST:", host);

const ns = require("@neondatabase/serverless");
const sql = ns.neon(url);

(async () => {
  const t0 = Date.now();
  try {
    const r = await sql.query("SELECT 1 AS ok");
    console.log("OK in", Date.now() - t0, "ms");
    console.log("ROWS:", JSON.stringify(r.rows ?? r));
  } catch (e) {
    console.log("FAIL after", Date.now() - t0, "ms");
    console.log("ERROR_NAME:", e?.constructor?.name || e?.name || "Unknown");
    console.log("ERROR_MSG:", e?.message || "(no message)");
    if (e?.cause) {
      console.log("CAUSE_CODE:", e.cause.code || "(none)");
      console.log("CAUSE_MSG:", e.cause.message || String(e.cause));
    }
    if (e?.sourceError) {
      console.log("SOURCE_ERROR:", String(e.sourceError).slice(0, 400));
    }
  }
})();
