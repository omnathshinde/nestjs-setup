import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseFilters } from "@nestjs/common";
import { UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { MulterExceptionFilter } from "@/common/multer-exception.filter";
import { TodoStatus } from "@/types/todos.types";

import { CreateTodoDto } from "./dto/create-todo.dto";
import { UpdateTodoDto } from "./dto/update-todo.dto";
import { TodosService } from "./todos.service";

@Controller("todos")
export class TodosController {
	constructor(private readonly todosService: TodosService) {}

	@Post()
	@UseInterceptors(FileInterceptor("file"))
	create(
		@Body()
		body: CreateTodoDto,
		@UploadedFile()
		file?: Express.Multer.File,
	) {
		return this.todosService.create(body, file);
	}
	@Get()
	findAll(
		@Query("search")
		search?: string,
		@Query("status")
		status?: TodoStatus,
	) {
		return this.todosService.findAll({
			search,
			status,
		});
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.todosService.findOne(id);
	}

	@Patch(":id")
	@UseFilters(MulterExceptionFilter)
	@UseInterceptors(
		FileInterceptor("file", {
			limits: {
				fileSize: 10 * 1024 * 1024, // 10MB
			},
		}),
	)
	update(
		@Param("id") id: string,

		@Body()
		body: UpdateTodoDto,

		@UploadedFile()
		file?: Express.Multer.File,
	) {
		return this.todosService.update(id, body, file);
	}
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.todosService.remove(id);
	}

	@Get(":id/file")
	async getFileUrl(@Param("id") id: string) {
		const url = await this.todosService.getFileUrl(id);
		return { url };
	}
}
