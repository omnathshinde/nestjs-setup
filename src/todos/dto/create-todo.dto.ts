import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

import { TodoStatus } from "@/types/todos.types";

export class CreateTodoDto {
	@IsString()
	@IsNotEmpty()
	title!: string;

	@IsString()
	@IsNotEmpty()
	description!: string;

	@IsOptional()
	@IsEnum(TodoStatus)
	status?: TodoStatus;

	@IsOptional()
	@IsString()
	reminderAt?: string;
}
