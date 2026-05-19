import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import type { Item } from "dynamoose/dist/Item";
import type { Model } from "dynamoose/dist/Model";

import { DatabaseModel, models } from "@/database/models/index";

@Injectable()
export class DatabaseService implements OnModuleInit {
	private readonly logger = new Logger(DatabaseService.name);

	async onModuleInit(): Promise<void> {
		this.logger.log("Initializing DynamoDB...");
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
}
