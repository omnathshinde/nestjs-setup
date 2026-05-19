import type { Item } from "dynamoose/dist/Item";
import type { Model } from "dynamoose/dist/Model";

import { TodoModel } from "./todo.model";
import { UserModel } from "./user.model";

export interface DatabaseModel {
	readonly name: string;
	readonly model: Model<Item>;
}

export const models = [
	{
		name: "todos",
		model: TodoModel,
	},
	{
		name: "users",
		model: UserModel,
	},
] as const satisfies readonly DatabaseModel[];
