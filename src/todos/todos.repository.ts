import { Injectable } from "@nestjs/common";

import { TodoModel } from "@/database/models/todo.model";
import { GetAllResponse } from "@/types/api.types";
import type { Todo, TodoStatus } from "@/types/todos.types";

interface FindAllQuery {
	search?: string;
	status?: TodoStatus;
}

@Injectable()
export class TodosRepository {
	async create(data: Partial<Todo>): Promise<Todo> {
		const todo = await TodoModel.create(data);
		return todo.toJSON() as Todo;
	}

	async findAll(query: FindAllQuery): Promise<GetAllResponse<Todo>> {
		const { search, status } = query;

		let scan = TodoModel.scan();
		if (status && status !== ("ALL" as TodoStatus)) {
			scan = scan.where("status").eq(status);
		}
		if (search?.trim()) {
			scan = scan.where("title").contains(search);
		}
		const todos = await scan.exec();
		const data = todos.map((todo) => todo.toJSON() as Todo);
		return { count: data.length, data };
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
