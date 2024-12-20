import { ISeguroComplementarioUseCase } from './seguroComplementario.usecase.interface';
import { ConfirmarProductosSinCoberturaPayload, ConfirmarSeguroComplementarioPayload } from './interface';
import { IYappService } from '../../../../infra/services/yapp/interface';
import { ApiResponse, HttpCodes } from './api.response';

export class SeguroComplementarioUseCase implements ISeguroComplementarioUseCase {
  constructor(private readonly yappService: IYappService) {}

  public async confirmarCotizacion(payload: ConfirmarSeguroComplementarioPayload) {
    const { proveedor } = payload;

    if (proveedor === 'Yapp') {
      const response = await this.confirmarCotizacionYapp(payload);
      return { status: HttpCodes.OK, message: 'Cotizacion confirmada correctamente.', data: response };
    }

    throw new ApiResponse(HttpCodes.NOT_FOUND, null, 'No se encontro el proveedor.');
  }

  private async confirmarCotizacionYapp(payload: ConfirmarSeguroComplementarioPayload) {
    const confirmacion_yapp = await this.yappService.confirmarSeguroComplementario(payload);
    console.log('Cotizacion de Yapp confirmada: ', JSON.stringify(confirmacion_yapp, null, 2));

    if (!confirmacion_yapp) {
      throw new ApiResponse(HttpCodes.BAD_REQUEST, confirmacion_yapp, 'Error al confirmar cotizacion de Yapp.');
    }

    return confirmacion_yapp;
  }

  public async confirmarProductosSinCobertura(payload: ConfirmarProductosSinCoberturaPayload) {
    const response = await this.yappService.confirmarProductosSinCobertura(payload);
    return { status: HttpCodes.OK, message: 'Documentos generados correctamente.', data: response };
  }

  public async confirmarProductosConCobertura(payload: ConfirmarSeguroComplementarioPayload) {
    const response = await this.yappService.confirmarProductosConCobertura(payload);
    return { status: HttpCodes.OK, message: 'Confirmacion completa de seguro complementario.', data: response };
  }
}
