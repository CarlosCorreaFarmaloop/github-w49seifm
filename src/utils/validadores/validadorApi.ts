import { APIGatewayProxyEvent } from 'aws-lambda';
import { registrador } from '../registrador';
import { ErrorDeValidacion } from '../errores';
import { EventInput } from '../../interface';
import { validarEsquemaSeguroComplementario } from './esquemas';

export function validarSolicitudApi(evento: APIGatewayProxyEvent): EventInput {
  // Validar método HTTP
  if (evento.httpMethod !== 'POST') {
    throw new ErrorDeValidacion('Método HTTP no permitido');
  }

  // Validar ruta
  if (evento.path !== '/seguro-complementario') {
    throw new ErrorDeValidacion('Ruta no encontrada');
  }

  // Validar Content-Type
  const contentType = evento.headers['Content-Type'] || evento.headers['content-type'];
  if (!contentType?.includes('application/json')) {
    throw new ErrorDeValidacion('Content-Type debe ser application/json');
  }

  try {
    const cuerpo = JSON.parse(evento.body || '{}');
    return validarEsquemaApi(cuerpo);
  } catch (error) {
    registrador.error('Error al procesar solicitud API', { error });
    throw new ErrorDeValidacion('Formato JSON inválido en el cuerpo de la solicitud');
  }
}

function validarEsquemaApi(datos: any): EventInput {
  const resultado = validarEsquemaSeguroComplementario(datos);
  
  if (!resultado.status) {
    throw new ErrorDeValidacion(`Error de validación: ${resultado.message}`);
  }

  return datos;
}