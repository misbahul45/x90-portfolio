"use strict";
const dns = require("node:dns");

console.log("BEFORE patch:", dns.lookup === dns.lookup ? "unmodified" : "patched");

// Simulate the db.ts patch inline
const originalLookup = dns.lookup;
const isNeonHost = (h) => /\.neon\.tech$/i.test(h);
dns.lookup = function patched(host, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = undefined;
  }
  const opts = (options ?? {});
  if (isNeonHost(host) && !opts.all) {
    return originalLookup(host, { family: 4, all: false }, callback);
  }
  return originalLookup(host, options, callback);
};

const host = "ep-small-flower-awbzx7li.c-12.us-east-1.aws.neon.tech";
dns.lookup(host, { family: 4 }, (e, a, f) => {
  console.log("v4 explicit:", a, f);
  dns.lookup(host, {}, (e2, a2, f2) => {
    console.log("default family:", a2, f2);
  });
});
