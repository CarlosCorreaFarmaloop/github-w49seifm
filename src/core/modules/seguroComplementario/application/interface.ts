export interface ConfirmarSeguroComplementarioPayload {
  cliente: Cliente;
  cotizacion: Cotizacion;
  id_interno: string;
  orden: Orden;
  proveedor: Proveedor;
}

export interface Cliente {
  apellido: string;
  correo_electronico: string;
  nombre: string;
  telefono: string;
}

export interface Cotizacion {
  id: string;
  productos: ProductoCotizacion[];
  tipo_documento: string;
}

interface ProductoCotizacion {
  cantidad: number;
  copago_unitario: number;
  deducible_unitario: number;
  descuento_unitario: number;
  lote: string;
  nombre: string;
  precio_unitario: number;
  sku: string;
}

export interface Orden {
  precio_delivery: number;
  productos: ProductoOrden[];
}

interface ProductoOrden {
  cantidad: number;
  lote: string;
  nombre: string;
  precio_unitario: number;
  sku: string;
}

export type Proveedor = 'Yapp';

export interface SeguroComplementarioResponse {
  id_interno: string;
  documentos: Documento[];
  url_voucher: string;
}

export interface Documento {
  destinatario: 'Cliente' | 'Seguro Complementario';
  documento_referencia: string;
  emisor: 'Bsale';
  fecha_emision: Date;
  numero_documento: string;
  timbre_electronico: string;
  tipo_documento: 'Boleta' | 'Guia de despacho' | 'Factura';
  url_documento: string;
}

export interface ConfirmarProductosSinCoberturaPayload {
  cliente: Cliente;
  cotizacion: Cotizacion;
  id_interno: string;
  orden: Orden;
  proveedor: Proveedor;
}

export interface ConfirmarProductosSinCoberturaResponse {
  id_interno: string;
  documentos: Documento[];
}
