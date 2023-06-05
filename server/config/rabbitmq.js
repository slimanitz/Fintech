const amqp = require('amqplib');

let channel; let
  connection; // global variables
async function connectQueue() {
  try {
    connection = await amqp.connect('amqp://localhost:5672');
    channel = await connection.createChannel();

    await channel.assertQueue('test-queue');
  } catch (error) {
    console.log(error);
  }
}

module.exports = { connectQueue, channel, connection };
