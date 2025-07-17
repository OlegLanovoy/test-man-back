"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRabbit = connectRabbit;
exports.sendToQueue = sendToQueue;
exports.consumeQueue = consumeQueue;
const amqplib_1 = __importDefault(require("amqplib"));
const secrets_1 = require("./secrets");
let channel;
async function connectRabbit() {
    const connection = await amqplib_1.default.connect(secrets_1.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue("tasks");
}
function sendToQueue(msg) {
    channel.sendToQueue("tasks", Buffer.from(msg));
}
function consumeQueue(callback) {
    channel.consume("tasks", (msg) => {
        if (msg !== null) {
            callback(msg.content.toString());
            channel.ack(msg);
        }
    });
}
