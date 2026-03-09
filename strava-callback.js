const https = require("https");

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    }).on("error", reject);
  });
}

function httpsPost(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function refreshToken(refreshToken) {
  const payload = JSON.stringify({
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const result = await httpsPost({
    hostname: "www.strava.com",
    path: "/oauth/token",
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) },
  }, payload);
  return JSON.parse(result.body);
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const { path, access_token, refresh_token, expires_at } = event.queryStringParameters || {};

    if (!access_token && !refresh_token) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: "No token provided" }) };
    }

    let token = access_token;
    let newTokenData = null;

    // Refresh if expired (with 5 min buffer)
    if (expires_at && Date.now() / 1000 > parseInt(expires_at) - 300) {
      const refreshed = await refreshToken(refresh_token);
      if (refreshed.access_token) {
        token = refreshed.access_token;
        newTokenData = {
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          expires_at: refreshed.expires_at,
        };
      }
    }

    const apiPath = path || "/api/v3/athlete/activities?per_page=100";
    const stravaUrl = `https://www.strava.com${apiPath}`;
    const result = await httpsGet(stravaUrl, { Authorization: `Bearer ${token}` });
    const data = JSON.parse(result.body);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data, newTokenData }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
