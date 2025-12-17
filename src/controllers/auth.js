const base64 = require('base-64');
require('dotenv').config();
const crypto = require('crypto');
const dir = require('path').resolve(__dirname, '../../.password');

function _decodeCredentials(header) {
  const encode = header.trim().replace(/Basic\s+/i, '');
  const decode = base64.decode(encode);
  return decode.split(':');
}

function auth(req, res, next) {
  const [username, password] = _decodeCredentials(
    req.headers.authorization || ''
  );
  let userInfo = new Map();
  require('fs')
    .readFileSync(dir, 'utf-8')
    .split(/\r?\n/)
    .map((line) => {
      const [username, password, role] = line.split(':');
      const info = { password, role };
      // console.log('user-pass', username, password, role);
      userInfo.set(username, info);
    });
  // console.log('User-Pass', userInfo);
  if (
    userInfo.has(username) &&
    userInfo.get(username).password ==
      hashPasswordWithSHA256(username, password)
  ) {
    req.role = userInfo.get(username).role;
    // 对密码做SHA256哈希
    // const sha256Pwd = hashPasswordWithSHA256(username, password);
    // console.log('123456 SHA256哈希后：', sha256Pwd);
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="user_pages"');
  res.status(401).send('Authentication required!');
}

const hashPasswordWithSHA256 = (username, password) => {
  return crypto
    .createHash('sha256')
    .update(`${username}:${password}:${process.env.MD5_SECRET}`)
    .digest('hex'); // 生成64位16进制摘要
};

module.exports = {
  auth,
};
