const { default: mongoose } = require('mongoose');
const { mongoUrl } = require('./vars');

const connect = async () => {
  await mongoose.connect(mongoUrl);
  console.log('DB Up and running');
};

module.exports = connect;
