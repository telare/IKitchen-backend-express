export type HttpCodes = 400 | 401 | 404 | 409 | 500;
export type AppErrorMessage = {
  message: string;
  statusCode: number;
  description: string;
};
const DefaultMessages: {
  [key in HttpCodes]: string;
} = {
  400: "Invalid request.",
  401: "Unauthorized user.",
  404: "Resource not found.",
  409: "User already exists.",
  500: "Internal server error occured.",
};

// add '.' for message there instead of pass it
export class AppError extends Error {
  statusCode: HttpCodes;
  constructor(statusCode: HttpCodes, message?: string) {
    super(message || DefaultMessages[statusCode]);
    this.statusCode = statusCode;
  }

  getError(): AppErrorMessage {
    switch (this.statusCode) {
      case 400:
        return {
          message: this.message || DefaultMessages[this.statusCode],
          statusCode: this.statusCode,
          description: "Ensure that the data in the request is correct.",
        };
      case 401:
        return {
          message: this.message || DefaultMessages[this.statusCode],
          statusCode: this.statusCode,
          description:
            "Ensure that the credentials included in the request are correct.",
        };
      case 404:
        return {
          message: this.message || DefaultMessages[this.statusCode],
          statusCode: this.statusCode,
          description: "Try to use other path.",
        };
      case 409:
        return {
          message: this.message || DefaultMessages[this.statusCode],
          statusCode: this.statusCode,
          description: "Try signing in or use another email address.",
        };
      case 500:
        return {
          message: this.message || DefaultMessages[this.statusCode],
          statusCode: this.statusCode,
          description: "Internal server error.",
        };
      default:
        return {
          message: this.message || DefaultMessages[this.statusCode],
          statusCode: this.statusCode,
          description: "Internal server error.",
        };
    }
  }
}
