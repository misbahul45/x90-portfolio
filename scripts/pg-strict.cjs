"use strict";
const fs = require("node:fs");
const path = require("node:path");
const dns = require("node:dns/promises");
const { Client } = require("pg");

const env = fs.readFileSync(path.join(process.cwd(), ".env"), "utf8");
const m = env.match(/DATABASE_URL="([^"]+)"/);
const u = new URL(m[1]);
const host = u.hostname;

(async () => {
  const v4 = (await dns.lookup(host, { family: 4 })).address;
  console.log("v4", v4);
  const c = new Client({
    host,
    hostaddr: v4,
    port: Number(u.port || 5432),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, "") || "neondb",
    ssl: { rejectUnauthorized: true },
    connectionTimeoutMillis: 15000,
  });
  c.on("connect", () => console.log("PG: connect (TCP)"));
  c.on("sslconnect", () => console.log("PG: sslconnect"));
  c.on("error", (e) => console.log("PG: error", e.code, e.message));
  c.on("end", () => console.log("PG: end"));
  const t0 = Date.now();
  try {
    await c.connect();
    console.log("OK", Date.now() - t0, "ms");
    const r = await c.query("SELECT current_database() AS db");
    console.log("QUERY", r.rows);
    await c.end();
  } catch (e) {
    console.log("FAIL", Date.now() - t0, "ms", e.code, e.message);
  }
})();
