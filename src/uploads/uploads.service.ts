import { randomUUID } from "node:crypto";

import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";

import { PutObjectCommand, type PutObjectCommandInput } from "@aws-sdk/client-s3";

import { s3 } from "@/configs/aws.config";

type UploadedFile = Express.Multer.File;

@Injectable()
export class UploadsService {
	private readonly logger = new Logger(UploadsService.name);

	private readonly bucket = "todos-files";

	async uploadFile(file: UploadedFile): Promise<string> {
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
			const fileUrl = this.buildFileUrl(key);
			this.logger.log(`File uploaded successfully: ${key}`);
			return fileUrl;
		} catch (error: unknown) {
			if (error instanceof Error) {
				this.logger.error(`S3 upload failed: ${error.message}`);
				throw new InternalServerErrorException("Failed to upload file");
			}
			this.logger.error("Unknown S3 upload error");
			throw new InternalServerErrorException("Failed to upload file");
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
}
