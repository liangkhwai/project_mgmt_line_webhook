const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const app = express();
const port = 3001;
const qs = require("qs");
app.use(bodyParser.json());

const LINE_CHANNEL_LOGIN_ID = process.env.LINE_CHANNEL_LOGIN_ID;
const LINE_CHANNEL_LOGIN_SECRET = process.env.LINE_CHANNEL_LOGIN_SECRET;
const LINE_REDIRECT_URI = "https://34.126.100.66:3001/callback";

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/auth", (req, res) => {
  const state = "BIS_SUSU"; // Optional: Add a state value for security
  const authUrl =
    `https://access.line.me/oauth2/v2.1/authorize?` +
    `response_type=code` +
    `&client_id=${LINE_CHANNEL_LOGIN_ID}` +
    `&redirect_uri=${LINE_REDIRECT_URI}` +
    `&state=${state}` +
    `&scope=openid%20profile`;
  res.redirect(authUrl);
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    res.status(200).send("Authentication failed");
    return;
  }

  console.log(req.query);
  console.log(code);
  // Exchange the authorization code for an access token
  try {
    const tokenResponse = await axios.post(
      "https://api.line.me/oauth2/v2.1/token",
      qs.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: LINE_REDIRECT_URI,
        client_id: LINE_CHANNEL_LOGIN_ID,
        client_secret: LINE_CHANNEL_LOGIN_SECRET,
      })
    );

    const { access_token } = tokenResponse.data;
    // Use the access token to fetch the user's profile, including userId
    const profileResponse = await axios.get("https://api.line.me/v2/profile", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    // console.log(profileResponse);
    const { userId } = profileResponse.data;
    console.log("userId", userId);
    // res.send(`Authentication successful. Your LINE userId: ${userId}`);
    // res.redirect(
    //   "https://line.me/R/ti/p/@124mwdzz?from=page&accountId=124mwdzz"
    // );
    res.redirect(
      "http://localhost:3000/dashboard/line/invite?userId=" + userId
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred during authentication");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
