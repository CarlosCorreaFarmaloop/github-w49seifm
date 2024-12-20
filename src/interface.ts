import { ConfirmarSeguroComplementarioPayload } from './core/modules/seguroComplementario/application/interface';

export interface EventInput {
  accion: Accion;
  payload: ConfirmarSeguroComplementarioPayload;
  origen: string;
}

export type Accion =
  | 'confirmar-seguro-complementario'
  | 'confirmar-productos-sin-cobertura'
  | 'confirmar-productos-con-cobertura';
