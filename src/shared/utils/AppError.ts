import { Request } from "express";
export type HttpCodes = 400 | 401 | 404 | 409 | 500;
export type AppErrorMessage = {
  title: `${string}.`;
  statusCode: HttpCodes;
  description: `${string}.`;
  instance: string;
};

const defaultConfig: {
  [key in HttpCodes]: {
    title: `${string}.`;
    description: `${string}.`;
  };
} = {
  400: {
    title: "Invalid request.",
    description: "Ensure that the data in the request is correct.",
  },
  401: {
    title: "Unauthorized user.",
    description:
      "Ensure that the credentials included in the request are correct.",
  },
  404: {
    title: "Resource not found.",
    description:
      "Ensure that the credentials included in the request are correct.",
  },
  409: {
    title: "User already exists.",
    description: "Try other credentials.",
  },
  500: {
    title: "Internal server error occured.",
    description:
      "Some error happened on the server side, please try again later.",
  },
};
export class AppError extends Error {
  statusCode: HttpCodes;
  description: AppErrorMessage["description"];
  instance: string;

  constructor(
    statusCode: AppErrorMessage["statusCode"],
    req: Request,
    title?: AppErrorMessage["title"],
    description?: AppErrorMessage["description"]
  ) {
    super(title || defaultConfig[statusCode].title);
    this.statusCode = statusCode;
    this.description = description || defaultConfig[statusCode].description;
    this.instance = req.originalUrl;
  }

  getError():AppErrorMessage {
    return {
      title: this.message as `${string}.`,
      statusCode:this.statusCode,
      description: this.description,
      instance: this.instance
    };
  }
}
