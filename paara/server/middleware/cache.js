const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

module.exports.cache = (ttl = 300) => (req, res, next) => {
  if (req.method !== "GET") return next();
  const key = req.originalUrl;
  const cached = cache.get(key);
  if (cached) return res.json(cached);
  const origJson = res.json.bind(res);
  res.json = (body) => { if (res.statusCode === 200) cache.set(key, body, ttl); return origJson(body); };
  next();
};

module.exports.invalidate = (pattern) => {
  cache.keys().forEach(k => { if (k.includes(pattern)) cache.del(k); });
};
