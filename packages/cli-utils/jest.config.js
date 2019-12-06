const baseConfig = require("../../jest.base");
const pack = require("./package");

module.exports = {
  ...baseConfig,
  displayName: pack.name,
  name: pack.name
};
