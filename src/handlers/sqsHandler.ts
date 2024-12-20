import { SQSEvent } from 'aws-lambda';
import { logger } from '../utils/logger';
import { validarEvento } from '../utils/eventValidator';
import { processRequest } from '../core/requestProcessor';
import { formatSqsResponse } from '../utils/responseFormatter';

export async function handleSQSEvent(event: SQSEvent): Promise<void> {
  logger.info('Processing SQS event', { recordCount: event.Records.length });

  try {
    for (const record of event.Records) {
      const validatedEvent = validarEvento(event);
      
      if (!validatedEvent) {
        logger.error('Invalid SQS event data', { messageId: record.messageId });
        continue;
      }

      await processRequest(validatedEvent);
      logger.info('Successfully processed SQS message', { messageId: record.messageId });
    }

    return formatSqsResponse();
  } catch (error) {
    logger.error('Error processing SQS event', { error });
    throw error;
  }
}