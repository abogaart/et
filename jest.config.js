const baseConfig = require("./jest.base");

module.exports = {
  ...baseConfig,
  projects: ["<rootDir>/packages/*"]
};
