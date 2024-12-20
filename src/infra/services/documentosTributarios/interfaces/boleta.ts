import { Producto } from './common';

export interface GenerarBoletaPayload {
  accion: 'generar-documento-tributario';
  payload: Boleta;
  origen: string;
}

export interface Boleta {
  comentario: string;
  delivery?: Delivery;
  id_interno: string;
  productos: Producto[];
  proveedor: Emisor;
  tipo_documento: 'Boleta';
  tipo_pago: TipoPago;
}

interface Delivery {
  precio_unitario: number;
  titulo: string;
}

export type TipoPago = 'Efectivo-Prepago' | 'Credito' | 'Debito' | 'Transferencia' | 'Dinero-Cuenta';

export interface BoletaResponse {
  documento_referencia: string;
  emisor: Emisor;
  fecha_emision: Date;
  id_interno: string;
  numero_documento: string;
  timbre_electronico: string;
  tipo_documento: 'Boleta';
  url_documento: string;
}

export type Emisor = 'Bsale';
