import { Injectable } from "@nestjs/common";

import { GetAllResponse } from "@/types/api.types";
import type { Todo, TodoStatus } from "@/types/todos.types";

import { CreateTodoDto } from "./dto/create-todo.dto";
import { UpdateTodoDto } from "./dto/update-todo.dto";
import { TodosRepository } from "./todos.repository";

interface FindAllQuery {
	search?: string;
	status?: TodoStatus;
}

@Injectable()
export class TodosService {
	constructor(private readonly todosRepository: TodosRepository) {}

	async create(body: CreateTodoDto): Promise<Todo> {
		return this.todosRepository.create(body);
	}

	async findAll(query: FindAllQuery): Promise<GetAllResponse<Todo>> {
		return this.todosRepository.findAll(query);
	}

	async findOne(id: string): Promise<Todo | null> {
		return this.todosRepository.findOne(id);
	}

	async update(id: string, body: UpdateTodoDto): Promise<Todo | null> {
		return this.todosRepository.update(id, body);
	}

	async remove(id: string): Promise<void> {
		return this.todosRepository.remove(id);
	}
}
