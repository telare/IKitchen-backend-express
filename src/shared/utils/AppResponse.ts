type ResponsePagination = {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextUrl: string | null;
  prevUrl: string | null;
};

type ResponseMeta = {
  total: number;
  cacheHit: boolean;
};

export type AppResponseMessage = {
  status: number;
  data: unknown;
  message: string;
  apiVersion: `v${number}`;
  pagination: ResponsePagination;
  meta: ResponseMeta;
};

export const defaultResponse: AppResponseMessage = {
  status: 500,
  data: [],
  apiVersion: "v1",
  message: "",
  pagination: {
    currentPage: 0,
    perPage: 0,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
    nextUrl: null,
    prevUrl: null,
  },
  meta: {
    total: 0,
    cacheHit: false,
  },
};

export class AppResponse {
  #status;
  #data;
  #message;
  #apiVersion;
  #pagination;
  #meta;

  private constructor({
    status,
    data,
    message,
    apiVersion,
    pagination,
    meta,
  }: AppResponseMessage) {
    this.#data = data;
    this.#status = status;
    this.#message = message;
    this.#apiVersion = apiVersion;
    this.#pagination = pagination;
    this.#meta = meta;
  }

  static fromArgs(
    status: AppResponseMessage["status"],
    data: unknown,
    message: AppResponseMessage["message"],
    apiVersion?: AppResponseMessage["apiVersion"],
    pagination?: AppResponseMessage["pagination"],
    meta?: AppResponseMessage["meta"]
  ): AppResponse {

    apiVersion = apiVersion ?? defaultResponse.apiVersion;
    pagination = pagination ?? defaultResponse.pagination;
    meta = meta ?? defaultResponse.meta;
    
    return new AppResponse({
      status,
      data,
      message,
      apiVersion,
      pagination,
      meta,
    });
  }

  getStatus(): number {
    return this.#status;
  }

  getMessage(): AppResponseMessage {
    return {
      status: this.#status,
      data: this.#data,
      message: this.#message,
      apiVersion: this.#apiVersion,
      pagination: this.#pagination,
      meta: this.#meta,
    };
  }
}
