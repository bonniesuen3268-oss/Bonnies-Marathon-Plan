const https = require("https");

function post(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  const { code, error } = event.queryStringParameters || {};
  const appUrl = process.env.URL;

  if (error || !code) {
    return {
      statusCode: 302,
      headers: { Location: `${appUrl}/?error=access_denied` },
      body: "",
    };
  }

  const payload = JSON.stringify({
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
  });

  const options = {
    hostname: "www.strava.com",
    path: "/oauth/token",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  const result = await post(options, payload);
  const data = JSON.parse(result.body);

  if (!data.access_token) {
    return {
      statusCode: 302,
      headers: { Location: `${appUrl}/?error=token_failed` },
      body: "",
    };
  }

  // Pass tokens to the frontend via URL fragment (never logged by servers)
  const fragment = encodeURIComponent(
    JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      athlete: {
        firstname: data.athlete?.firstname,
        lastname: data.athlete?.lastname,
      },
    })
  );

  return {
    statusCode: 302,
    headers: { Location: `${appUrl}/?auth=${fragment}` },
    body: "",
  };
};
