const Redis = require('ioredis');
const { redisPassword, redisHost, redisPort } = require('./vars');

const redisClient = new Redis({
  username: 'default',
  password: redisPassword,
  socket: {
    host: redisHost,
    port: redisPort,
  },
  commandTimeout: 5000,
  retryStrategy: () => 5000,
});

redisClient.setList = (key, list) => (
  Promise.all(list.map((element, index) => (
    Promise.all([
      redisClient.hmset(`${key}${index}`, element),
      redisClient.lpush(key, `${key}${index}`),
    ]))))
);

redisClient.getList = async (key) => {
  const keysList = await redisClient.lrange(key, 0, -1);
  const list = await Promise.all(keysList
    .map((elementKey) => (redisClient.hgetall(elementKey))));
  return list;
};

redisClient.deleteList = async (key) => {
  const elementKey = await redisClient.lrange(key, 0, -1);
  Promise.all(elementKey.map((element) => redisClient.del(element)));
  await redisClient.del(key);
};

redisClient.on('connect', () => console.log('Redis up and running'));
redisClient.on('error', () => console.log('Redis is Down trying to reconnect ...'));

module.exports.redisClient = redisClient;
