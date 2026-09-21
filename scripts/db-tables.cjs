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
  const r = await sql.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' ORDER BY table_name
  `);
  console.log("DB tables:");
  for (const x of r) console.log("  ", x.table_name);
})();
