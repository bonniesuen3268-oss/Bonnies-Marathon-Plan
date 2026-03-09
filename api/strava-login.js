exports.handler = async (event) => {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.URL + "/api/strava-callback";

  const stravaAuthUrl =
    `https://www.strava.com/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&approval_prompt=auto` +
    `&scope=activity:read_all`;

  return {
    statusCode: 302,
    headers: { Location: stravaAuthUrl },
    body: "",
  };
};
