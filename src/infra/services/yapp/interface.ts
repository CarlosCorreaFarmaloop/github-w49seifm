import {
  ConfirmarProductosSinCoberturaPayload,
  ConfirmarProductosSinCoberturaResponse,
  ConfirmarSeguroComplementarioPayload,
  SeguroComplementarioResponse,
} from '../../../core/modules/seguroComplementario/application/interface';

export interface IYappService {
  confirmarSeguroComplementario: (
    payload: ConfirmarSeguroComplementarioPayload
  ) => Promise<SeguroComplementarioResponse>;
  confirmarProductosSinCobertura: (
    payload: ConfirmarProductosSinCoberturaPayload
  ) => Promise<ConfirmarProductosSinCoberturaResponse>;
  confirmarProductosConCobertura: (
    payload: ConfirmarSeguroComplementarioPayload
  ) => Promise<SeguroComplementarioResponse>;
}

export interface VoucherResponse {
  beneficiary_identity_number: string;
  beneficiary_name: string;
  cap: number;
  copay: number;
  insurance_company_identity_number: string;
  insurance_company_name: string;
  insurance_contribution: number;
  policy_deductible: number;
  policy: number;
  products: VoucherProduct[];
  reimbursement: number;
  request_id: number;
  sales_deductible: number;
  sales_document_id: number;
}

interface VoucherProduct {
  cap: number;
  copay: number;
  discount: number;
  insurance_contribution: number;
  name: string;
  policy_deductible: number;
  price: number;
  quantity: number;
  reimbursement: number;
  sales_deductible: number;
  sku: string;
}
