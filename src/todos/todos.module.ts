import { Module } from "@nestjs/common";

import { UploadsModule } from "@/uploads/uploads.module";

import { TodosController } from "./todos.controller";
import { TodosRepository } from "./todos.repository";
import { TodosService } from "./todos.service";

@Module({
	imports: [UploadsModule],
	controllers: [TodosController],
	providers: [TodosService, TodosRepository],
})
export class TodosModule {}
