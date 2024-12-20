import { Respuesta } from './api.response';
import {
  ConfirmarProductosSinCoberturaPayload,
  ConfirmarSeguroComplementarioPayload,
  SeguroComplementarioResponse,
  ConfirmarProductosSinCoberturaResponse,
} from './interface';

export interface ISeguroComplementarioUseCase {
  confirmarCotizacion: (
    payload: ConfirmarSeguroComplementarioPayload
  ) => Promise<Respuesta<SeguroComplementarioResponse>>;
  confirmarProductosSinCobertura: (
    payload: ConfirmarProductosSinCoberturaPayload
  ) => Promise<Respuesta<ConfirmarProductosSinCoberturaResponse>>;
  confirmarProductosConCobertura: (
    payload: ConfirmarSeguroComplementarioPayload
  ) => Promise<Respuesta<SeguroComplementarioResponse>>;
}
