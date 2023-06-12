/* index.js */

const Piscina = require('piscina');
const { resolve } = require('path');
const { connect } = require('../../config/database');
const User = require('../../api/models/user');
const Account = require('../../api/models/account');
const { userRolesEnum } = require('../../utils/enums');

const NUMBER_OF_THREADS = 8;

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
  const pool = new Piscina({ filename: resolve(__dirname, 'worker.js') });
  await connect();
  const users = await User.findAll({
    where: { role: userRolesEnum.CLIENT, isActive: true },
    limit: 200,
    raw: true,
    nest: true,
  });
  const accounts = await Account.findAll({
    raw: true,
    nest: true,
    limit: 500,
  });
  const threads = [];
  console.log(`Execution with ${users.length} users and ${accounts.length} accounts`);

  const chunks = chunkArray(users, NUMBER_OF_THREADS);

  chunks.forEach((element) => {
    threads.push(pool.run({ users: element, accounts }));
  });

  // Run operation on the chunks in parallel
  const result = await Promise.all(threads);
  console.log(result);
  process.exit();
};

module.exports = main;
