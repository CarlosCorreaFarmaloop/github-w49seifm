import { ErrorDeValidacion } from './errores';
import { EventInput } from '../interface';
import { registrador } from './registrador';

export function validarEntrada(entrada: any): EventInput {
  if (!entrada?.accion || !entrada?.payload) {
    throw new ErrorDeValidacion('Entrada inválida: faltan campos requeridos');
  }

  const accionesValidas = [
    'confirmar-seguro-complementario',
    'confirmar-productos-sin-cobertura',
    'confirmar-productos-con-cobertura'
  ];

  if (!accionesValidas.includes(entrada.accion)) {
    throw new ErrorDeValidacion(`Acción inválida: ${entrada.accion}`);
  }

  return entrada as EventInput;
}

export function validarEvento(evento: any): EventInput | null {
  if (!evento.Records || evento.Records.length === 0) {
    registrador.error('No se encontraron registros en el evento', { evento });
    return null;
  }

  try {
    const cuerpo = JSON.parse(evento.Records[0].body);
    
    if (!cuerpo.detail) {
      registrador.error('Falta el detalle en el cuerpo del evento', { cuerpo });
      return null;
    }

    return cuerpo.detail;
  } catch (error) {
    registrador.error('Error al procesar el evento', { error });
    return null;
  }
}