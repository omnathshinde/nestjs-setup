import { Module } from "@nestjs/common";

import { RemindersModule } from "@/reminders/reminders.module";

import { DatabaseService } from "./database.service";

@Module({
	imports: [RemindersModule],
	providers: [DatabaseService],
	exports: [DatabaseService],
})
export class DatabaseModule {}
