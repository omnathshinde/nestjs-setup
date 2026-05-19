import { randomUUID } from "node:crypto";

import dynamoose from "@/database/dynamoose.config";

const UserSchema = new dynamoose.Schema(
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

export const UserModel = dynamoose.model("users", UserSchema, {
	initialize: false,
});
