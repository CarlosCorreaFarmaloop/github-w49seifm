import { SeguroComplementarioResponse } from '../../../core/modules/seguroComplementario/application/interface';

export interface ISeguroComplementarioInputService {
  notificarConfirmacion: (payload: SeguroComplementarioResponse) => Promise<boolean>;
  notificarProductosSinCobertura: (payload: SeguroComplementarioResponse) => Promise<boolean>;
}

export interface NotificacionDeConfirmacion {
  action: 'confirmar-seguro-complementario';
  body: {
    documents: Documento[];
    internal_id: string;
    vouchers_url: string[];
  };
  origin: 'seguro-complementario';
}

interface Documento {
  destinatario: string;
  emissionDate: Date;
  emitter: 'Bsale';
  number: string;
  referenceDocumentId: string;
  type: BillingType;
  urlBilling: string;
  urlTimbre: string;
}

export type BillingType = 'Boleta' | 'Factura' | 'Despacho';

export interface NotificarProductosSinCobertura {
  action: 'confirmar-productos-sin-cobertura';
  body: {
    documents: Documento[];
    internal_id: string;
  };
  origin: 'seguro-complementario';
}
