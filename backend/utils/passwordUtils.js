const bcrypt = require('bcrypt');
const { security } = require('../config/envConfig');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, security.passwordSaltRounds);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
};