/* eslint-disable class-methods-use-this */
const amqp = require('amqplib');

class RabbitMq {
  connection;

  channel;

  connectQueue = async () => {
    try {
      this.connection = await amqp.connect('amqp://localhost:5672');
      this.channel = await this.connection.createChannel();
      console.log('Connected to RabbitMQ succesfully');
    } catch (error) {
      console.log('Error connectting to RabbitMQ');
      console.log(error);
    }
  };

  publishData = async (topic, data) => {
    // send data to queue
    await this.channel.sendToQueue(topic, Buffer.from(JSON.stringify(data), { nack: true }), {
      persistent: true,
    });
  };

  consumeData = async (topic) => {
    const channel = await this.connection.createChannel();
    const messages = [];
    await channel.consume(topic, (message) => {
      console.log(`Inside Consumer ${Buffer.from(message.content)}`);
      messages.push(message);
    }, { noAck: false });
    await channel.close();

    return messages;
  };

  createSubject = async (topic) => {
    await this.channel.assertQueue(topic, {
      durable: true,
    });
  };
}

const rabbitMqClient = new RabbitMq();

module.exports = rabbitMqClient;
