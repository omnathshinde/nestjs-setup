import { randomUUID } from "node:crypto";

import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";

import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3 } from "@/configs/aws.config";
import { TodoFile } from "@/types/todos.types";

type UploadedFile = Express.Multer.File;

@Injectable()
export class UploadsService {
	private readonly logger = new Logger(UploadsService.name);

	private readonly bucket = "todos-files";

	async uploadFile(file: UploadedFile): Promise<TodoFile> {
		this.validateFile(file);

		const key = this.generateFileKey(file.originalname);

		const command: PutObjectCommandInput = {
			Bucket: this.bucket,
			Key: key,
			Body: file.buffer,
			ContentType: file.mimetype,
			ContentLength: file.size,
		};

		try {
			await s3.send(new PutObjectCommand(command));
			// const fileUrl = await this.generatePresignedUrl(key);
			this.logger.log(`File uploaded successfully: ${key}`);
			return {
				key,
				url: "",
				name: file.originalname,
				size: file.size,
				mimeType: file.mimetype,
				extension: file.originalname.split(".").pop() ?? "",
				etag: "",
				uploadedAt: new Date().toISOString(),
				status: "UPLOADED",
				storageProvider: "S3",
			};
		} catch (error: unknown) {
			if (error instanceof Error) {
				this.logger.error(`S3 upload failed: ${error.message}`);
				throw new InternalServerErrorException("Failed to upload file");
			}
			this.logger.error("Unknown S3 upload error");
			throw new InternalServerErrorException("Failed to upload file");
		}
	}

	async deleteFile(key: string): Promise<void> {
		try {
			await s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
			this.logger.log(`File deleted successfully: ${key}`);
		} catch (error: unknown) {
			if (error instanceof Error) {
				this.logger.error(`S3 delete failed: ${error.message}`);
			}
		}
	}

	private validateFile(file: UploadedFile): void {
		if (!file) {
			throw new InternalServerErrorException("File is required");
		}
		if (!file.buffer) {
			throw new InternalServerErrorException("Invalid file buffer");
		}
		if (!file.originalname) {
			throw new InternalServerErrorException("Invalid file name");
		}
	}

	private generateFileKey(fileName: string): string {
		return `${randomUUID()}-${fileName}`;
	}

	private buildFileUrl(key: string): string {
		return `http://localhost:4566/${this.bucket}/${key}`;
	}

	private async generatePresignedUrl(key: string): Promise<string> {
		const command = new GetObjectCommand({
			Bucket: this.bucket,
			Key: key,
		});
		return getSignedUrl(s3, command, {
			expiresIn: 20,
		});
	}

	async attachPresignedUrl(file: TodoFile): Promise<TodoFile> {
		return { ...file, url: await this.generatePresignedUrl(file.key) };
	}
}
