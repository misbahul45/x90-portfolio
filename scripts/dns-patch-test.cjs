import dns from "node:dns"
import dnsP from "node:dns/promises"
import "../src/db"

const host = "ep-small-flower-awbzx7li-pooler.c-12.us-east-1.aws.neon.tech"
dns.lookup(host, { family: 4 }, (e, a, f) => {
  console.log("sync v4:", a, f)
  dns.lookup(host, { family: 6 }, (e2, a2, f2) => {
    console.log("sync v6:", a2, f2)
    dnsP.lookup(host, { family: 4 }).then((r) => console.log("promise v4:", r)).catch((e) => console.log("err", e))
  })
})
