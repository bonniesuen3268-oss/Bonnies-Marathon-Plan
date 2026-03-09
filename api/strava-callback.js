var https = require("https");

function post(options, body) {
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
  var code = req.query.code;
  var error = req.query.error;
  var appUrl = "https://bonnies-marathon-plan.vercel.app";

  if (error || !code) {
    return res.redirect(appUrl + "/?error=access_denied");
  }

  var payload = JSON.stringify({
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    code: code,
    grant_type: "authorization_code"
  });

  var options = {
    hostname: "www.strava.com",
    path: "/oauth/token",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload)
    }
  };

  try {
    var result = await post(options, payload);
    var data = JSON.parse(result.body);

    if (!data.access_token) {
      return res.redirect(appUrl + "/?error=token_failed");
    }

    var auth = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      athlete: {
        firstname: data.athlete ? data.athlete.firstname : "",
        lastname: data.athlete ? data.athlete.lastname : ""
      }
    };

    var fragment = encodeURIComponent(JSON.stringify(auth));
    res.redirect(appUrl + "/?auth=" + fragment);
  } catch(e) {
    res.redirect(appUrl + "/?error=exception");
  }
};
