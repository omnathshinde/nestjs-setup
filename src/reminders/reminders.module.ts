import { Module } from "@nestjs/common";

import { ReminderConsumer } from "./reminder.consumer";
import { ReminderGateway } from "./reminder.gateway";
import { ReminderProducer } from "./reminder.producer";

@Module({
	providers: [ReminderProducer, ReminderConsumer, ReminderGateway],
	exports: [ReminderProducer, ReminderConsumer],
})
export class RemindersModule {}
