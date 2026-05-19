import { Injectable } from "@nestjs/common";

import type { Express } from "express";

import { GetAllResponse } from "@/types/api.types";
import type { Todo, TodoStatus } from "@/types/todos.types";
import { UploadsService } from "@/uploads/uploads.service";

import { CreateTodoDto } from "./dto/create-todo.dto";
import { UpdateTodoDto } from "./dto/update-todo.dto";
import { TodosRepository } from "./todos.repository";
interface FindAllQuery {
	search?: string;
	status?: TodoStatus;
}

@Injectable()
export class TodosService {
	constructor(
		private readonly todosRepository: TodosRepository,
		private readonly uploadsService: UploadsService,
	) {}

	async create(body: CreateTodoDto, file?: Express.Multer.File): Promise<Todo> {
		let fileUrl: string | undefined;

		if (file) {
			fileUrl = await this.uploadsService.uploadFile(file);
		}

		return this.todosRepository.create({ ...body, fileUrl });
	}
	async findAll(query: FindAllQuery): Promise<GetAllResponse<Todo>> {
		return this.todosRepository.findAll(query);
	}

	async findOne(id: string): Promise<Todo | null> {
		return this.todosRepository.findOne(id);
	}

	async update(id: string, body: UpdateTodoDto, file?: Express.Multer.File): Promise<Todo | null> {
		let fileUrl: string | undefined;

		if (file) {
			fileUrl = await this.uploadsService.uploadFile(file);
		}
		return this.todosRepository.update(id, { ...body, ...(fileUrl && { fileUrl }) });
	}

	async remove(id: string): Promise<void> {
		return this.todosRepository.remove(id);
	}
}
