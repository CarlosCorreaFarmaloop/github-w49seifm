import { SQSEvent } from 'aws-lambda';
import { EventInput } from '../interface';
import { logger } from './logger';

export function validarEvento(event: SQSEvent): EventInput | null {
  if (!event.Records || event.Records.length === 0) {
    logger.error('No records found in event', { event });
    return null;
  }

  try {
    const record = event.Records[0];
    const body = JSON.parse(record.body);
    
    if (!body.detail) {
      logger.error('Missing detail in event body', { body });
      return null;
    }

    return body.detail;
  } catch (error) {
    logger.error('Error parsing event', { error });
    return null;
  }
}