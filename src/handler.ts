import { APIGatewayProxyEvent, SQSEvent } from 'aws-lambda';
import { validarMensajeSqs } from './utils/validadores/validadorSqs';
import { validarSolicitudApi } from './utils/validadores/validadorApi';
import { ErrorDeProcesamiento } from './utils/errores';
import { registrador } from './utils/registrador';
import { formatearRespuestaApi } from './utils/formateadorRespuesta';
import { SeguroComplementarioUseCase } from './core/modules/seguroComplementario/application/seguroComplementario.usecase';
import { YappService } from './infra/services/yapp/yapp';
import { DocumentosTributariosService } from './infra/services/documentosTributarios/documentosTributarios';

export const handler = async (evento: SQSEvent | APIGatewayProxyEvent) => {
  try {
    const documentosTributariosService = new DocumentosTributariosService();
    const yappService = new YappService(documentosTributariosService);
    const seguroComplementarioUseCase = new SeguroComplementarioUseCase(yappService);

    // Determinar tipo de evento y validar
    const entrada = 'Records' in evento 
      ? validarMensajeSqs(evento as SQSEvent)
      : validarSolicitudApi(evento as APIGatewayProxyEvent);

    const { accion, payload } = entrada;

    const resultado = await procesarSolicitud(accion, payload, seguroComplementarioUseCase);

    // Si es API Gateway, devolver respuesta formateada
    if (!('Records' in evento)) {
      return formatearRespuestaApi(200, {
        mensaje: 'Solicitud procesada exitosamente',
        datos: resultado
      });
    }

  } catch (error) {
    registrador.error('Error al procesar solicitud:', { error });
    
    if ('Records' in evento) {
      throw error; // Para SQS, relanzar error para reintentos
    }
    
    // Para API Gateway, devolver error formateado
    return formatearRespuestaApi(400, {
      mensaje: 'Error al procesar la solicitud',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

async function procesarSolicitud(
  accion: string, 
  payload: any, 
  useCase: SeguroComplementarioUseCase
) {
  switch (accion) {
    case 'confirmar-seguro-complementario':
      return await useCase.confirmarCotizacion(payload);
    case 'confirmar-productos-sin-cobertura':
      return await useCase.confirmarProductosSinCobertura(payload);
    case 'confirmar-productos-con-cobertura':
      return await useCase.confirmarProductosConCobertura(payload);
    default:
      throw new ErrorDeProcesamiento('Acción no soportada');
  }
}