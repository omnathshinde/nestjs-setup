import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

import { Server } from "socket.io";

@WebSocketGateway({
	cors: {
		origin: "*",
	},
})
export class ReminderGateway {
	@WebSocketServer()
	server!: Server;

	sendReminder(data: { id: string; title: string; description: string }): void {
		this.server.emit("todo-reminder", data);
	}
}
