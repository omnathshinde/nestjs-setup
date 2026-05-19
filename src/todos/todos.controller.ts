import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";

import { TodoStatus } from "@/types/todos.types";

import { CreateTodoDto } from "./dto/create-todo.dto";
import { UpdateTodoDto } from "./dto/update-todo.dto";
import { TodosService } from "./todos.service";

@Controller("todos")
export class TodosController {
	constructor(private readonly todosService: TodosService) {}

	@Post()
	create(@Body() body: CreateTodoDto) {
		return this.todosService.create(body);
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
	update(@Param("id") id: string, @Body() body: UpdateTodoDto) {
		return this.todosService.update(id, body);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.todosService.remove(id);
	}
}
