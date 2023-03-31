const connect = require('./config/database');
const app = require('./config/server');
const { host } = require('./config/vars');

app.listen(8080, async () => {
  await connect();
  console.log(`The server is running on ${host}`);
});

module.exports = app;
