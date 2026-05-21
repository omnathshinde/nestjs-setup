import { ArgumentsHost, Catch, ExceptionFilter, PayloadTooLargeException } from "@nestjs/common";

import { MulterError } from "multer";

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
	catch(exception: MulterError, _host: ArgumentsHost) {
		if (exception.code === "LIMIT_FILE_SIZE") {
			throw new PayloadTooLargeException("File size must be less than 10MB");
		}
		throw exception;
	}
}
