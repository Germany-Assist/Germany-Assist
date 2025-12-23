const googleOAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: `${process.env.FRONTEND_URL}/auth/callback`,
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  userInfoEndpoint: "https://www.googleapis.com/oauth2/v3/userinfo",
  authEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  scopes: ["openid", "profile", "email"],
};

export default googleOAuthConfig;
