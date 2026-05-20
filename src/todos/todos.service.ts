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
		let uploadedFile: Todo["file"] | undefined;

		if (file) {
			uploadedFile = await this.uploadsService.uploadFile(file);
		}

		const todo = await this.todosRepository.create({
			...body,
			...(uploadedFile && {
				file: uploadedFile,
			}),
		});

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
		const result = await this.todosRepository.findAll(query);
		const data = await Promise.all(
			result.data.map(async (todo) => {
				if (todo.file) {
					todo.file = await this.uploadsService.attachPresignedUrl(todo.file);
				}
				return todo;
			}),
		);
		return { count: result.count, data };
	}

	async findOne(id: string): Promise<Todo | null> {
		const todo = await this.todosRepository.findOne(id);

		if (!todo) {
			return null;
		}

		if (todo.file) {
			todo.file = await this.uploadsService.attachPresignedUrl(todo.file);
		}

		return todo;
	}

	async update(id: string, body: UpdateTodoDto, file?: Express.Multer.File): Promise<Todo | null> {
		const existing = await this.todosRepository.findOne(id);
		if (!existing) {
			return null;
		}
		let uploadedFile: Todo["file"] | undefined;

		if (file) {
			uploadedFile = await this.uploadsService.uploadFile(file);
		}

		const updated = await this.todosRepository.update(id, {
			...body,
			...(uploadedFile && {
				file: uploadedFile,
			}),
		});
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
		const todo = await this.todosRepository.findOne(id);
		if (!todo) {
			return;
		}
		if (todo.file?.key) {
			await this.uploadsService.deleteFile(todo.file.key);
		}
		return this.todosRepository.remove(id);
	}
}
