const https = require("https");

const httpClient = (
  options,
  data,
  callback = undefined,
  onError = undefined
) => {
  let responseData = "";
  try {
    const request = https.request(options, (response) => {
      // console.log("Response", response);

      console.log(`statusCode: ${response.statusCode}`);
      response.on("data", (chunk) => {
        // console.log("Chunk", chunk);
        // process.stdout.write(chunk);
        responseData += chunk;
      });

      response.on("end", async () => {
        // console.log("Response Data End", responseData);
        // Transformation of data if needed
        if (callback) {
          callback(responseData);
        }
      });
    });

    request.on("error", (error) => {
      console.log("Error\n");
      if (onError) {
        onError(error);
      }
    });
    if (data) request.write(data);
    request.end();
  } catch (e) {
    console.error("Error ", e);
    // logger
  }
};

module.exports = { httpClient };
