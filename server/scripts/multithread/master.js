/* index.js */

const Piscina = require('piscina');
const { resolve } = require('path');
const connect = require('../../config/database');
const User = require('../../api/models/user');
const Account = require('../../api/models/account');
const { userRolesEnum } = require('../../utils/enums');

const NUMBER_OF_THREADS = 8;
// Read all JSON file contents into an array

function chunkArray(array, chunks) {
  const chunkSize = Math.ceil(array.length / chunks); // calculate the size of each chunk
  const result = []; // initialize the resulting array of arrays

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize); // slice the array into a chunk
    result.push(chunk); // add the chunk to the result array
  }

  return result;
}

const main = async () => {
  // Divide the content into two chunks

  const pool = new Piscina({ filename: resolve(__dirname, 'worker.js') });
  await connect();
  const users = await User.find({ role: userRolesEnum.CLIENT }).limit(1000);
  const random = Math.floor(Math.random() * 300);
  const accounts = await Account.find().skip(random).limit(50);
  const threads = [];

  const chunks = chunkArray(users, NUMBER_OF_THREADS);

  chunks.forEach((element) => {
    threads.push(pool.run({ users: element, accounts }));
  });

  // Run operation on the chunks parallely
  const result = await Promise.all(threads);
  console.log(result);
  process.exit();
};

module.exports = main;
