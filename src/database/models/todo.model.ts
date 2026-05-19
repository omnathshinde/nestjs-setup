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
		reminderAt: String,
		fileUrl: String,
	},
	{ timestamps: true },
);

export const TodoModel = dynamoose.model("todos", TodoSchema, {
	initialize: false,
});
