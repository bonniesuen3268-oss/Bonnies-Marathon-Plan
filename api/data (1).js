var https = require("https");

module.exports = async function(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") return res.status(200).end();

  var athleteId = req.query.athlete_id;
  if (!athleteId) return res.status(400).json({ error: "No athlete_id" });

  var kvUrl = process.env.KV_REST_API_URL;
  var kvToken = process.env.KV_REST_API_TOKEN;
  var hostname = kvUrl.replace("https://", "");
  var key = "bonnie_" + athleteId;

  function kvReq(method, path, bodyData) {
    return new Promise(function(resolve, reject) {
      var bodyStr = bodyData ? JSON.stringify(bodyData) : null;
      var opts = {
        hostname: hostname,
        path: path,
        method: method,
        headers: { "Authorization": "Bearer " + kvToken, "Content-Type": "application/json" }
      };
      if (bodyStr) opts.headers["Content-Length"] = Buffer.byteLength(bodyStr);
      var r = https.request(opts, function(response) {
        var d = "";
        response.on("data", function(c) { d += c; });
        response.on("end", function() { try { resolve(JSON.parse(d)); } catch(e) { resolve({}); } });
      });
      r.on("error", reject);
      if (bodyStr) r.write(bodyStr);
      r.end();
    });
  }

  if (req.method === "GET") {
    try {
      var result = await kvReq("GET", "/get/" + key, null);
      var data = (result && result.result) ? JSON.parse(result.result) : null;
      res.json({ data: data });
    } catch(e) { res.status(500).json({ error: e.message }); }
  } else if (req.method === "POST") {
    try {
      var payload = req.body || {};
      await kvReq("POST", "/set/" + key, [JSON.stringify(payload)]);
      res.json({ ok: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  }
};
