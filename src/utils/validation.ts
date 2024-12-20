import { ValidationError } from './errors';
import { EventInput } from '../interface';

export function validateEventInput(input: any): EventInput {
  if (!input?.accion || !input?.payload) {
    throw new ValidationError('Invalid event input: missing required fields');
  }

  const validActions = [
    'confirmar-seguro-complementario',
    'confirmar-productos-sin-cobertura',
    'confirmar-productos-con-cobertura'
  ];

  if (!validActions.includes(input.accion)) {
    throw new ValidationError(`Invalid action: ${input.accion}`);
  }

  return input as EventInput;
}