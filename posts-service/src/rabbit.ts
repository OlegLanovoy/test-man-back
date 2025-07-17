import amqp from "amqplib";
import { RABBITMQ_URL } from "./secrets";

let channel: amqp.Channel;

export async function connectRabbit() {
  const connection = await amqp.connect(RABBITMQ_URL!);
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
