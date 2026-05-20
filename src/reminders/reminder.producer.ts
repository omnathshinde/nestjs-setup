import { Injectable } from "@nestjs/common";

import { SendMessageCommand } from "@aws-sdk/client-sqs";

import { sqs } from "@/configs/sqs.config";

@Injectable()
export class ReminderProducer {
	private readonly queueUrl = "http://localhost:4566/000000000000/todo-reminders";

	async scheduleReminder(data: {
		id: string;
		title: string;
		description: string;
		reminderAt: string;
	}): Promise<void> {
		const reminderDate = new Date(data.reminderAt);
		const delaySeconds = Math.floor((reminderDate.getTime() - Date.now()) / 1000);
		await sqs.send(
			new SendMessageCommand({
				QueueUrl: this.queueUrl,
				MessageBody: JSON.stringify(data),
				DelaySeconds: Math.min(Math.max(delaySeconds, 0), 900),
			}),
		);
	}
}
