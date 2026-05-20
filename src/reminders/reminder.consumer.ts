import { Injectable, Logger } from "@nestjs/common";

import { DeleteMessageCommand, ReceiveMessageCommand } from "@aws-sdk/client-sqs";

import { sqs } from "@/configs/sqs.config";
import { TodoModel } from "@/database/models/todo.model";

import { ReminderGateway } from "./reminder.gateway";

interface ReminderMessage {
	id: string;
	title: string;
	description: string;
}

@Injectable()
export class ReminderConsumer {
	private readonly logger = new Logger(ReminderConsumer.name);

	private readonly queueUrl = "http://localhost:4566/000000000000/todo-reminders";

	constructor(private readonly reminderGateway: ReminderGateway) {}

	async startPolling(): Promise<void> {
		try {
			const result = await sqs.send(
				new ReceiveMessageCommand({
					QueueUrl: this.queueUrl,
					MaxNumberOfMessages: 10,
					WaitTimeSeconds: 20,
				}),
			);
			if (result.Messages) {
				for (const message of result.Messages) {
					if (!message.Body) {
						continue;
					}
					const data = JSON.parse(message.Body) as ReminderMessage;
					this.logger.log(`Reminder Triggered: ${data.title}`);
					this.reminderGateway.sendReminder(data);
					await TodoModel.update({ id: data.id, reminderStatus: "SENT" });
					if (message.ReceiptHandle) {
						await sqs.send(
							new DeleteMessageCommand({
								QueueUrl: this.queueUrl,
								ReceiptHandle: message.ReceiptHandle,
							}),
						);
					}
				}
			}
		} catch (error) {
			this.logger.error("Reminder polling failed", error);
		}

		setImmediate(() => {
			void this.startPolling();
		});
	}
}
