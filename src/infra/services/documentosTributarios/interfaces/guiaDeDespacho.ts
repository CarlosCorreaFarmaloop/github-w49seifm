import { Producto } from './common';

export interface GenerarGuiaDeDespachoPayload {
  accion: 'generar-documento-tributario';
  payload: GuiaDeDespacho;
  origen: string;
}

export interface GuiaDeDespacho {
  cliente: Cliente;
  comentario: string;
  delivery?: Delivery;
  direccion_destino: DireccionDeDestino;
  id_interno: string;
  productos: Producto[];
  proveedor: Emisor;
  tipo_documento: 'Guia de despacho';
  tipo_guia: number;
}

interface Cliente {
  actividad: string;
  comuna: string;
  correo: string;
  direccion: string;
  nombre: string;
  region: string;
  rut: string;
}

interface Delivery {
  precio_unitario: number;
  titulo: string;
}

interface DireccionDeDestino {
  calle: string;
  comuna: string;
  nombre_receptor: string;
  numero_calle: string;
  numero_domicilio: string;
  pais: string;
  referencias: string;
  region: string;
  tipo_domicilio: string;
}

export interface GuiaDeDespachoResponse {
  documento_referencia: string;
  emisor: Emisor;
  fecha_emision: Date;
  id_interno: string;
  numero_documento: string;
  timbre_electronico: string;
  tipo_documento: 'Guia de despacho';
  url_documento: string;
}

export type Emisor = 'Bsale';
