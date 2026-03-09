module.exports = function(req, res) {
  var clientId = process.env.STRAVA_CLIENT_ID;
  var redirectUri = "https://bonnies-marathon-plan.vercel.app/api/strava-callback";
  var url = "https://www.strava.com/oauth/authorize" +
    "?client_id=" + clientId +
    "&redirect_uri=" + encodeURIComponent(redirectUri) +
    "&response_type=code" +
    "&approval_prompt=auto" +
    "&scope=activity:read_all";
  res.redirect(url);
};
