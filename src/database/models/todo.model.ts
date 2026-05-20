import { randomUUID } from "node:crypto";

import dynamoose from "@/database/dynamoose.config";

const TodoSchema = new dynamoose.Schema(
	{
		id: {
			type: String,
			hashKey: true,
			default: () => randomUUID(),
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
			default: "PENDING",
		},
		reminderAt: {
			type: String,
			index: {
				name: "ReminderIndex",
			},
		},
		reminderStatus: {
			type: String,
			default: "PENDING",
			index: {
				name: "ReminderStatusIndex",
			},
		},
		file: {
			type: Object,
			schema: {
				key: { type: String },
				url: { type: String },
				name: { type: String },
				size: { type: Number },
				mimeType: { type: String },
				extension: { type: String },
				etag: { type: String },
				uploadedAt: { type: String },
				status: {
					type: String,
					enum: ["UPLOADING", "UPLOADED", "FAILED", "DELETED"],
					default: "UPLOADED",
				},
				storageProvider: { type: String, default: "S3" },
			},
		},
	},
	{ timestamps: true },
);

export const TodoModel = dynamoose.model("todos", TodoSchema, {
	initialize: false,
});
