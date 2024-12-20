import { APIGatewayProxyResult } from 'aws-lambda';

export interface ApiResponse extends APIGatewayProxyResult {
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Credentials': boolean;
  };
}

export interface ApiErrorResponse {
  message: string;
  error: string;
}