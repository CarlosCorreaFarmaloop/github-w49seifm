import { GenerarBoletaPayload, BoletaResponse } from './interfaces/boleta';
import { GenerarGuiaDeDespachoPayload, GuiaDeDespachoResponse } from './interfaces/guiaDeDespacho';

export interface IDocumentosTributariosService {
  generarBoleta: (payload: GenerarBoletaPayload) => Promise<BoletaResponse>;
  generarGuiaDeDespacho: (payload: GenerarGuiaDeDespachoPayload) => Promise<GuiaDeDespachoResponse>;
}
