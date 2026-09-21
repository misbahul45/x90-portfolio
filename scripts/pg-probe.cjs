// Single-shot pg.Client probe — TLS handshake with unpooled Neon.
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const dns = require("node:dns/promises");
const { Client } = require("pg");

const env = fs.readFileSync(path.join(process.cwd(), ".env"), "utf8");
const m = env.match(/DATABASE_URL="([^"]+)"/);
const url = m[1];
const host = new URL(url.replace(/^postgres/, "https")).host;
const u = new URL(url);
console.log("HOST:", host, "PORT:", u.port || 5432);

(async () => {
  const v4 = await dns.lookup(host, { family: 4 });
  console.log("V4:", v4.address);
  const c = new Client({
    host: host,
    hostaddr: v4.address,
    port: Number(u.port || 5432),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, "") || "neondb",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  c.on("error", (e) => console.log("pg err:", e.code, e.message));
  c.on("connect", () => console.log("pg connect"));
  c.on("sslconnect", () => console.log("pg sslconnect"));
  const t0 = Date.now();
  try {
    await c.connect();
    console.log("CONNECT OK in", Date.now() - t0, "ms");
    const r = await c.query("SELECT 1 AS ok, current_database() AS db");
    console.log("QUERY OK in", Date.now() - t0, "ms:", JSON.stringify(r.rows));
    await c.end();
  } catch (e) {
    console.log("FAIL after", Date.now() - t0, "ms");
    console.log("CODE:", e.code, "MSG:", e.message);
  }
})();
