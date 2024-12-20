import { SQSEvent } from 'aws-lambda';
import { registrador } from '../registrador';
import { ErrorDeValidacion } from '../errores';
import { EventInput } from '../../interface';

const LIMITE_TAMANO_MENSAJE = 262144; // 256KB en bytes

export function validarMensajeSqs(evento: SQSEvent): EventInput {
  if (!evento.Records?.[0]) {
    throw new ErrorDeValidacion('Mensaje SQS inválido: sin registros');
  }

  const mensaje = evento.Records[0];
  
  // Validar tamaño del mensaje
  if (Buffer.from(mensaje.body).length > LIMITE_TAMANO_MENSAJE) {
    throw new ErrorDeValidacion('Mensaje SQS excede el límite de tamaño de 256KB');
  }

  try {
    const cuerpo = JSON.parse(mensaje.body);
    
    if (!cuerpo.detail) {
      throw new ErrorDeValidacion('Mensaje SQS inválido: falta campo detail');
    }

    return validarEstructuraMensaje(cuerpo.detail);
  } catch (error) {
    registrador.error('Error al procesar mensaje SQS', { error });
    throw new ErrorDeValidacion('Formato JSON inválido en mensaje SQS');
  }
}

function validarEstructuraMensaje(mensaje: any): EventInput {
  const { accion, payload } = mensaje;

  if (!accion || !payload) {
    throw new ErrorDeValidacion('Mensaje inválido: faltan campos requeridos');
  }

  const accionesValidas = [
    'confirmar-seguro-complementario',
    'confirmar-productos-sin-cobertura',
    'confirmar-productos-con-cobertura'
  ];

  if (!accionesValidas.includes(accion)) {
    throw new ErrorDeValidacion(`Acción inválida: ${accion}`);
  }

  return mensaje;
}