"use strict";

const dns = require("node:dns");
const { Agent, setGlobalDispatcher } = require("undici");
dns.setDefaultResultOrder("ipv4first");
setGlobalDispatcher(new Agent({ connect: { family: 4 } }));

const fs = require("node:fs");
const path = require("node:path");
const env = fs.readFileSync(path.join(process.cwd(), ".env"), "utf8");
const m = env.match(/DATABASE_URL="([^"]+)"/);
const u = new URL(m[1]);
const { neon } = require("@neondatabase/serverless");
const sql = neon(m[1]);

(async () => {
  const cols = await sql.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'project'
    ORDER BY ordinal_position
  `);
  console.log("project columns:");
  for (const r of cols) console.log("  ", r.column_name, r.data_type);
})();
