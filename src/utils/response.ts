export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export function successResponse<T>(data: T, message: string = 'Success'): ApiResponse<T> {
  return {
    success: true,
    message,
    data
  };
}

export function errorResponse(error: string, message: string = 'Error'): ApiResponse {
  return {
    success: false,
    message,
    error
  };
}

export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      status: error.statusCode,
      response: errorResponse(error.message)
    };
  }
  
  console.error('Unhandled API Error:', error);
  return {
    status: 500,
    response: errorResponse('Internal server error')
  };
}