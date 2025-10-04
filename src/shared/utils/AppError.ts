import { Request } from "express";

export type HttpCodes = 400 | 401 | 404 | 429 | 409 | 500;

export type AppErrorMessage = {
  status: HttpCodes;
  title: string;
  detail: string;
  instance: string;
  errors: string[];
};

type AppErrorPropsOptions = {
  title: string;
  detail: string;
};

type AppErrorProps = {
  status: AppErrorMessage["status"];
  req: Request;
  options: AppErrorPropsOptions;
};

const defaultOptions: {
  [key in HttpCodes]: AppErrorPropsOptions;
} = {
  400: {
    title: "Invalid request.",
    detail: "Ensure that the data in the request is correct.",
  },
  401: {
    title: "Unauthorized user.",
    detail: "Ensure that the credentials included in the request are correct.",
  },
  404: {
    title: "Resource not found.",
    detail: "Ensure that the credentials included in the request are correct.",
  },
  409: {
    title: "User already exists.",
    detail: "Try other credentials.",
  },
  429: {
    title: "Too many requests.",
    detail: "Exceeded maximum number of requests. Try again later.",
  },
  500: {
    title: "Internal server error occured.",
    detail: "Some error happened on the server side, please try again later.",
  },
};
function formatRespMsg(msg: string) {
  if (!msg.endsWith(".")) return `${msg}.`;
  return msg;
}
export class AppError extends Error {
  #status: AppErrorMessage["status"];
  #title: string;
  #detail: string;
  #instance: string;
  #errors: string[];

  private constructor({
    status,
    reqURL,
    detail,
    errors,
  }: {
    status: AppErrorProps["status"];
    reqURL: string;
    detail?: string;
    errors?: string[];
  }) {
    super();
    this.#status = status;
    this.#detail = detail
      ? formatRespMsg(detail)
      : defaultOptions[status].detail;
    this.#instance = reqURL;
    this.#title = defaultOptions[status].title;
    this.#errors = errors ?? [];
  }

  static fromArgs(
    status: AppErrorProps["status"],
    reqURL: string,
    detail: string = defaultOptions[status].detail,
    errors: string[] = []
  ): AppError {
    return new AppError({
      status,
      reqURL,
      detail,
      errors,
    });
  }

  getStatus(): AppErrorProps["status"] {
    return this.#status;
  }
  getError(): AppErrorMessage {
    return {
      title: this.#title,
      status: this.#status,
      detail: this.#detail,
      instance: this.#instance,
      errors: this.#errors,
    };
  }
}
