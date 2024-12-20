import { SeguroComplementarioUseCase } from '../core/modules/seguroComplementario/application/seguroComplementario.usecase';
import { YappService } from '../infra/services/yapp/yapp';
import { DocumentosTributariosService } from '../infra/services/documentosTributarios/documentosTributarios';
import { EventInput } from '../interface';
import { logger } from '../utils/logger';

export async function processRequest(event: EventInput) {
  const documentosTributariosService = new DocumentosTributariosService();
  const yappService = new YappService(documentosTributariosService);
  const seguroComplementarioUseCase = new SeguroComplementarioUseCase(yappService);

  const { accion, payload } = event;

  switch (accion) {
    case 'confirmar-seguro-complementario':
      return await seguroComplementarioUseCase.confirmarCotizacion(payload);

    case 'confirmar-productos-sin-cobertura':
      return await seguroComplementarioUseCase.confirmarProductosSinCobertura(payload);

    case 'confirmar-productos-con-cobertura':
      return await seguroComplementarioUseCase.confirmarProductosConCobertura(payload);

    default:
      logger.error('Invalid action', { accion });
      throw new Error('Invalid action');
  }
}