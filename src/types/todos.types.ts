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
	file?: TodoFile;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface TodoFile {
	key: string;
	url: string;
	name: string;
	size: number;
	mimeType: string;
	extension: string;
	etag: string;
	uploadedAt: string;
	status: "UPLOADING" | "UPLOADED" | "FAILED" | "DELETED";
	storageProvider: string;
}
