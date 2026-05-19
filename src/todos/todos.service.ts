import { Injectable } from "@nestjs/common";

import { GetAllResponse } from "@/types/api.types";
import type { Todo } from "@/types/todos.types";

import { CreateTodoDto } from "./dto/create-todo.dto";
import { UpdateTodoDto } from "./dto/update-todo.dto";
import { TodosRepository } from "./todos.repository";

@Injectable()
export class TodosService {
	constructor(private readonly todosRepository: TodosRepository) {}

	async create(body: CreateTodoDto): Promise<Todo> {
		return this.todosRepository.create(body);
	}

	async findAll(): Promise<GetAllResponse<Todo>> {
		return this.todosRepository.findAll();
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
