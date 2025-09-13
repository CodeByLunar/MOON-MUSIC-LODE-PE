const JOSH = require("@joshdb/core");

const JSON = require("@joshdb/json");

module.exports.premiumLogs = new JOSH({
  name: "premiumLogs",
  provider: JSON,
  providerOptions: {
    cleanupEmpty: true,
    dataDir: "./josh-data/premiumLogs",
  },
});
