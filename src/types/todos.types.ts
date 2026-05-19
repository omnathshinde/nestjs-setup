export enum TodoStatus {
	PENDING = "PENDING",
	IN_PROGRESS = "IN_PROGRESS",
	COMPLETED = "COMPLETED",
}

export interface Todo {
	id: string;
	title: string;
	description: string;
	status: TodoStatus;
	reminderAt?: string;
	fileUrl?: string;
	createdAt?: Date;
	updatedAt?: Date;
}
