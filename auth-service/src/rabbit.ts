import amqp from "amqplib";

let channel: amqp.Channel;

export async function connectRabbit() {
  const connection = await amqp.connect("amqp://guest:guest@localhost:5672");
  channel = await connection.createChannel();
  await channel.assertQueue("tasks");
}

export function sendToQueue(msg: string) {
  channel.sendToQueue("tasks", Buffer.from(msg));
}

export function consumeQueue(callback: (msg: string) => void) {
  channel.consume("tasks", (msg) => {
    if (msg !== null) {
      callback(msg.content.toString());
      channel.ack(msg);
    }
  });
}
