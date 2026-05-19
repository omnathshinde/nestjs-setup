import { IsEnum, IsOptional, IsString } from "class-validator";

import { TodoStatus } from "@/types/todos.types";

export class UpdateTodoDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsEnum(TodoStatus)
	status?: TodoStatus;

	@IsOptional()
	@IsString()
	reminderAt?: string;
}
