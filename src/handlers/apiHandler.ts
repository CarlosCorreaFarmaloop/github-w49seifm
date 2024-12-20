import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { logger } from '../utils/logger';
import { processRequest } from '../core/requestProcessor';
import { formatApiResponse } from '../utils/responseFormatter';

export async function handleAPIEvent(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  logger.info('Processing API Gateway event', { 
    path: event.path,
    method: event.httpMethod 
  });

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const result = await processRequest(body);
    
    return formatApiResponse(200, {
      message: 'Request processed successfully',
      data: result
    });
  } catch (error: any) {
    logger.error('Error processing API event', { error });
    
    return formatApiResponse(500, {
      message: 'Internal server error',
      error: error.message
    });
  }
}