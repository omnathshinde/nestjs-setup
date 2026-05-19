import { Injectable } from "@nestjs/common";

import { TodoModel } from "@/database/models/todo.model";
import { GetAllResponse } from "@/types/api.types";
import type { Todo } from "@/types/todos.types";

@Injectable()
export class TodosRepository {
	async create(data: Partial<Todo>): Promise<Todo> {
		const todo = await TodoModel.create(data);
		return todo.toJSON() as Todo;
	}

	async findAll(): Promise<GetAllResponse<Todo>> {
		const todos = await TodoModel.scan().exec();
		const data = todos.map((todo) => todo.toJSON() as Todo);
		return {
			count: data.length,
			data,
		};
	}

	async findOne(id: string): Promise<Todo | null> {
		const todo = await TodoModel.get(id);
		if (!todo) {
			return null;
		}
		return todo.toJSON() as Todo;
	}

	async update(id: string, data: Partial<Todo>): Promise<Todo | null> {
		const updatedTodo = await TodoModel.update({ id }, data);
		if (!updatedTodo) {
			return null;
		}
		return updatedTodo.toJSON() as Todo;
	}

	async remove(id: string): Promise<void> {
		await TodoModel.delete(id);
	}
}
