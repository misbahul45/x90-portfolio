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
  const want = {
    article: ["id","title","slug","excerpt","content","coverImage","status","publishedAt","readingTime","categoryId","authorId","embedding","createdAt","updatedAt"],
    project: ["id","title","slug","description","content","coverImage","technologies","categoryId","githubUrl","demoUrl","featured","order","status","publishedAt","createdAt","updatedAt"],
  };
  for (const [tbl, expected] of Object.entries(want)) {
    const r = await sql.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name=$1
    `, [tbl]);
    const have = new Set(r.map((x) => x.column_name));
    const missing = expected.filter((c) => !have.has(c));
    console.log(tbl, "missing:", missing);
  }
})();
