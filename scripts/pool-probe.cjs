const fs = require('node:fs');
const dns = require('node:dns');
const { Agent, setGlobalDispatcher } = require('undici');
dns.setDefaultResultOrder('ipv4first');
setGlobalDispatcher(new Agent({ connect: { family: 4 } }));
const ws = require('ws');
const ns = require('/home/misbahul45/code/x90-portfolio/node_modules/@neondatabase/serverless');
ns.neonConfig.webSocketConstructor = ws;
const env = fs.readFileSync('/home/misbahul45/code/x90-portfolio/.env.local','utf8');
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];
const u = new URL(url);
const pool = new ns.Pool();
console.log('BEFORE:', JSON.stringify({ host: pool.options?.host, user: pool.options?.user, db: pool.options?.database }));
pool.options = {
  ...pool.options,
  host: u.hostname, port: 5432,
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  database: 'neondb',
  ssl: true,
};
console.log('AFTER:', JSON.stringify({ host: pool.options?.host, user: pool.options?.user, db: pool.options?.database }));
(async () => {
  try {
    const r = await pool.query('SELECT 1 AS ok');
    console.log('OK', r.rows);
  } catch (e) {
    console.log('NAME:', e?.constructor?.name)
    console.log('MSG:', e?.message?.slice(0, 400))
    console.log('CODE:', e?.code)
    console.log('STACK:', (e?.stack || '').split('\n').slice(0, 8).join('\n'))
  }
  await pool.end();
})();
