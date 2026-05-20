import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { CreateBucketCommand } from "@aws-sdk/client-s3";
import { CreateQueueCommand } from "@aws-sdk/client-sqs";
import type { Item } from "dynamoose/dist/Item";
import type { Model } from "dynamoose/dist/Model";

import { s3 } from "@/configs/aws.config";
import { sqs } from "@/configs/sqs.config";
import { DatabaseModel, models } from "@/database/models/index";
import { ReminderConsumer } from "@/reminders/reminder.consumer";

@Injectable()
export class DatabaseService implements OnModuleInit {
	constructor(private readonly reminderConsumer: ReminderConsumer) {}
	private readonly logger = new Logger(DatabaseService.name);

	async onModuleInit(): Promise<void> {
		this.logger.log("Initializing DynamoDB...");
		await this.initializeS3();
		await this.initializeSqs();
		void this.reminderConsumer.startPolling();
		for (const modelConfig of models as readonly DatabaseModel[]) {
			await this.prepareTable(modelConfig.name, modelConfig.model);
		}
		this.logger.log("DynamoDB ready");
		this.logModelRegistry();
	}

	private async prepareTable(tableName: string, model: Model<Item>): Promise<void> {
		try {
			try {
				await model.table().create();
				this.logger.log(`Created table: ${tableName}`);
			} catch (error: unknown) {
				if (error instanceof Error && error.name === "ResourceInUseException") {
					this.logger.log(`Table exists: ${tableName}`);
				} else {
					throw error;
				}
			}

			await model.table().initialize();
			this.logger.log(`Initialized table: ${tableName}`);
		} catch (error: unknown) {
			if (error instanceof Error) {
				this.logger.error(error.message);
				return;
			}
			this.logger.error(`Unknown error for table: ${tableName}`);
		}
	}

	private logModelRegistry(): void {
		this.logger.log("📦 Registered DynamoDB Models:");
		for (const model of models as readonly DatabaseModel[]) {
			this.logger.log(`→ Table: ${model.name} | Model: ${model.model.table().name}`);
		}
		this.logger.log("✅ All DynamoDB tables are initialized and ready.");
	}

	private async initializeS3(): Promise<void> {
		const bucketName = "todos-files";
		try {
			await s3.send(
				new CreateBucketCommand({
					Bucket: bucketName,
				}),
			);
			this.logger.log(`Created S3 bucket: ${bucketName}`);
		} catch (error: unknown) {
			if (
				error instanceof Error &&
				(error.name === "BucketAlreadyOwnedByYou" || error.name === "BucketAlreadyExists")
			) {
				this.logger.log(`S3 bucket already exists: ${bucketName}`);
				return;
			}
			if (error instanceof Error) {
				this.logger.error(`S3 init failed: ${error.message}`);
				return;
			}
			this.logger.error("Unknown S3 initialization error");
		}
	}

	private async initializeSqs(): Promise<void> {
		try {
			await sqs.send(
				new CreateQueueCommand({
					QueueName: "todo-reminders",
				}),
			);

			this.logger.log("SQS queue ready: todo-reminders");
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error(error.message);
				return;
			}
		}
	}
}
