import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DatabaseModule } from "./database/database.module";
import { TodosModule } from "./todos/todos.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DatabaseModule,
		TodosModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
