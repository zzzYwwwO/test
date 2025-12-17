const base64 = require('base-64');
// require('dotenv').config();
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
  if (userInfo.has(username) && userInfo.get(username).password == password) {
    req.role = userInfo.get(username).role;
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="user_pages"');
  res.status(401).send('Authentication required!');

  // if (
  //   username === process.env.MONGOGUI_ADMIN_USERNAME &&
  //   password === process.env.MONGOGUI_ADMIN_PASSWORD
  // ) {
  //   req.isAdmin = true;
  //   return next();
  // } else {
  //   if (
  //     username === process.env.MONGOGUI_USER_USERNAME &&
  //     password === process.env.MONGOGUI_USER_PASSWORD
  //   ) {
  //     req.isAdmin = false;
  //     return next();
  //   }
  //   res.set('WWW-Authenticate', 'Basic realm="user_pages"');
  //   res.status(401).send('Authentication required!');
  // }
}

module.exports = {
  auth,
};
