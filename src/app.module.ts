import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

import { DatabaseModule } from "./database/database.module";
import { RemindersModule } from "./reminders/reminders.module";
import { TodosModule } from "./todos/todos.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
	imports: [
		ScheduleModule.forRoot(),
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DatabaseModule,
		TodosModule,
		RemindersModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
