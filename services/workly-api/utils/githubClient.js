const GITHUB_DOMAIN = "github.com";
const GITHUB_OAUTH = "/login/oauth/authorize";
const GITHUB_OAUTH_ACCESS_TOKEN = "/login/oauth/access_token";

const GITHUB_DOMAIN_API = "api.github.com";
const GITHUB_API_ROUTE_USER = "/user";
const GITHUB_ACCEPT_HEADER_V3 = "vnd.github.v3+json";

const { httpClient } = require("./httpClient");
class GitHubClient {
  constructor(clientName, clientId, clientSecret) {
    this.clientName = clientName;
    this.clientSecret = clientSecret;
    this.clientId = clientId;
  }
  getLoginURL(scopes) {
    let response = "";
    try {
      if (scopes) {
        response = {
          url: `https://${GITHUB_DOMAIN + GITHUB_OAUTH}?client_id=${this.clientId
            }&scope=${scopes.join(",")}`,
        };
      }
    } catch (e) {
      console.error("Error", e);
    }
    return response;
  }

  getAccessToken(code, callback = undefined, onError = undefined) {
    try {
      if (code) {
        const data = JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
        });

        const options = {
          hostname: GITHUB_DOMAIN,
          port: 443,
          method: "POST",
          path: GITHUB_OAUTH_ACCESS_TOKEN,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Content-Length": data.length,
          },
        };
        httpClient(options, data, callback, onError);
      }
    } catch (e) {
      console.error("Error", e);
    }
  }
  getUser(accessToken, callback = undefined, onError = undefined) {
    try {
      const dataOptions = {
        hostname: GITHUB_DOMAIN_API,
        port: 443,
        method: "GET",
        path: GITHUB_API_ROUTE_USER,
        headers: {
          "User-Agent": this.clientName,
          Authorization: `token ${accessToken}`,
          Accept: `application/${GITHUB_ACCEPT_HEADER_V3}`,
        },
      };

      httpClient(dataOptions, null, callback, onError);
    } catch (e) {
      console.error("Error", e);
    }
  }
}

module.exports = { GitHubClient };
