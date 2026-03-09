var https = require("https");

function httpsGet(url, headers) {
  return new Promise(function(resolve, reject) {
    https.get(url, { headers: headers }, function(res) {
      var data = "";
      res.on("data", function(c) { data += c; });
      res.on("end", function() { resolve({ status: res.statusCode, body: data }); });
    }).on("error", reject);
  });
}

function httpsPost(options, body) {
  return new Promise(function(resolve, reject) {
    var req = https.request(options, function(res) {
      var data = "";
      res.on("data", function(c) { data += c; });
      res.on("end", function() { resolve({ status: res.statusCode, body: data }); });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

module.exports = async function(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    var path = req.query.path || "/api/v3/athlete/activities?per_page=100";
    var access_token = req.query.access_token;
    var refresh_token = req.query.refresh_token;
    var expires_at = req.query.expires_at;

    if (!access_token) {
      return res.status(401).json({ error: "No token" });
    }

    var token = access_token;
    var newTokenData = null;

    if (expires_at && Date.now() / 1000 > parseInt(expires_at) - 300) {
      var payload = JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refresh_token
      });
      var refreshed = await httpsPost({
        hostname: "www.strava.com",
        path: "/oauth/token",
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
      }, payload);
      var rd = JSON.parse(refreshed.body);
      if (rd.access_token) {
        token = rd.access_token;
        newTokenData = { access_token: rd.access_token, refresh_token: rd.refresh_token, expires_at: rd.expires_at };
      }
    }

    var stravaUrl = "https://www.strava.com" + path;
    var result = await httpsGet(stravaUrl, { "Authorization": "Bearer " + token });
    var data = JSON.parse(result.body);

    res.json({ data: data, newTokenData: newTokenData });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
};
