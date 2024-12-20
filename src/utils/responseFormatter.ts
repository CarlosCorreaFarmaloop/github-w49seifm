import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * Formats API Gateway responses
 */
export function formatApiResponse(
  statusCode: number,
  body: Record<string, any>
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
  };
}

/**
 * Formats SQS processing responses
 */
export function formatSqsResponse(): void {
  // SQS processing is acknowledged by not throwing an error
  return;
}