import { Injectable } from "@nestjs/common";

import type { Express } from "express";

import { ReminderProducer } from "@/reminders/reminder.producer";
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
		private readonly reminderProducer: ReminderProducer,
	) {}

	async create(body: CreateTodoDto, file?: Express.Multer.File): Promise<Todo> {
		let fileUrl: string | undefined;

		if (file) {
			fileUrl = await this.uploadsService.uploadFile(file);
		}

		const todo = await this.todosRepository.create({ ...body, fileUrl });

		if (body.reminderAt) {
			await this.reminderProducer.scheduleReminder({
				id: todo.id,
				title: todo.title,
				description: todo.description,
				reminderAt: body.reminderAt,
			});
		}

		return todo;
	}
	async findAll(query: FindAllQuery): Promise<GetAllResponse<Todo>> {
		return this.todosRepository.findAll(query);
	}

	async findOne(id: string): Promise<Todo | null> {
		return this.todosRepository.findOne(id);
	}

	async update(id: string, body: UpdateTodoDto, file?: Express.Multer.File): Promise<Todo | null> {
		const existing = await this.todosRepository.findOne(id);
		if (!existing) {
			return null;
		}
		let fileUrl: string | undefined;

		if (file) {
			fileUrl = await this.uploadsService.uploadFile(file);
		}

		const updated = await this.todosRepository.update(id, { ...body, ...(fileUrl && { fileUrl }) });
		if (!updated) {
			return null;
		}
		if (body.reminderAt && body.reminderAt !== existing.reminderAt) {
			await this.reminderProducer.scheduleReminder({
				id: updated.id,
				title: updated.title,
				description: updated.description,
				reminderAt: body.reminderAt,
			});
		}
		return updated;
	}
	async remove(id: string): Promise<void> {
		return this.todosRepository.remove(id);
	}
}
