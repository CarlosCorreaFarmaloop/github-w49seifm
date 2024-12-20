import axios, { AxiosError, AxiosInstance } from 'axios';
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { IYappService, VoucherResponse } from './interface';
import { Producto } from '../documentosTributarios/interfaces/common';
import {
  ConfirmarProductosSinCoberturaPayload,
  ConfirmarProductosSinCoberturaResponse,
  ConfirmarSeguroComplementarioPayload,
  Documento,
} from '../../../core/modules/seguroComplementario/application/interface';
import { Boleta } from '../documentosTributarios/interfaces/boleta';
import { GuiaDeDespacho } from '../documentosTributarios/interfaces/guiaDeDespacho';
import { IDocumentosTributariosService } from '../documentosTributarios/interface';
import { ApiResponse, HttpCodes } from '../../../core/modules/seguroComplementario/application/api.response';

export class YappService implements IYappService {
  private readonly axiosInstance: AxiosInstance;
  private readonly s3Client: S3Client;

  constructor(private readonly documentosTributariosService: IDocumentosTributariosService) {
    this.axiosInstance = axios.create({
      headers: { 'x-api-key': process.env.YAPP_API_KEY },
      baseURL: process.env.YAPP_BASE_URL,
    });
    this.s3Client = new S3Client({});
  }

  confirmarSeguroComplementario = async (payload: ConfirmarSeguroComplementarioPayload) => {
    try {
      const { cotizacion, id_interno } = payload;

      const documentos_a_generar = this.generarDocumentos(payload);
      const documentos_generados: Documento[] = [];
      let numero_documento_cliente = 0;

      for (const documento of documentos_a_generar) {
        if (documento.tipo_documento === 'Boleta') {
          const boleta = await this.documentosTributariosService.generarBoleta({
            accion: 'generar-documento-tributario',
            payload: documento,
            origen: 'yapp-service',
          });

          if (!boleta) {
            console.log('Ocurrio un error al generar boleta: ', JSON.stringify({ payload, response: boleta }, null, 2));
            throw new Error('Ocurrio un error al generar boleta.');
          }

          documentos_generados.push({
            destinatario: 'Cliente',
            documento_referencia: boleta.documento_referencia,
            emisor: boleta.emisor,
            fecha_emision: boleta.fecha_emision,
            numero_documento: boleta.numero_documento,
            timbre_electronico: boleta.timbre_electronico,
            tipo_documento: boleta.tipo_documento,
            url_documento: boleta.url_documento,
          });

          numero_documento_cliente = Number(boleta.numero_documento);
        }

        if (documento.tipo_documento === 'Guia de despacho') {
          const guia_de_despacho = await this.documentosTributariosService.generarGuiaDeDespacho({
            accion: 'generar-documento-tributario',
            payload: documento,
            origen: 'yapp-service',
          });

          if (!guia_de_despacho) {
            console.log(
              'Ocurrio un error al generar guia de despacho: ',
              JSON.stringify({ payload, response: guia_de_despacho }, null, 2)
            );
            throw new Error('Ocurrio un error al generar guia de despacho.');
          }

          documentos_generados.push({
            destinatario: 'Seguro Complementario',
            documento_referencia: guia_de_despacho.documento_referencia,
            emisor: guia_de_despacho.emisor,
            fecha_emision: guia_de_despacho.fecha_emision,
            numero_documento: guia_de_despacho.numero_documento,
            timbre_electronico: guia_de_despacho.timbre_electronico,
            tipo_documento: guia_de_despacho.tipo_documento,
            url_documento: guia_de_despacho.url_documento,
          });

          if (numero_documento_cliente === 0) {
            numero_documento_cliente = Number(guia_de_despacho.numero_documento);
          }
        }
      }

      const numero_cotizacion = Number(cotizacion.id);
      const cotizacon_confirmada = await this.confirmarCotizacion(numero_cotizacion, numero_documento_cliente);
      if (!cotizacon_confirmada) {
        console.log(
          'Error al confirmar cotizacion: ',
          JSON.stringify(
            { payload: { numero_cotizacion, numero_documento_cliente }, response: { cotizacon_confirmada } },
            null,
            2
          )
        );
        throw new Error('Error al confirmar cotizacion.');
      }

      const voucher = await this.obtenerVoucher(numero_cotizacion);
      if (!voucher) {
        console.log(
          'Error al obtener voucher: ',
          JSON.stringify({ payload: { numero_cotizacion }, response: { voucher } }, null, 2)
        );
        throw new Error('Error al obtener voucher.');
      }

      const url_voucher = await this.generarVoucherPDF(voucher, cotizacion.id);
      if (!url_voucher) {
        console.log(
          'Error generar voucher pdf: ',
          JSON.stringify({ payload: { voucher }, response: { url_voucher } }, null, 2)
        );
        throw new Error('Error generar voucher pdf.');
      }

      return { documentos: documentos_generados, id_interno, url_voucher };
    } catch (error: any) {
      throw this.handleServiceError(error);
    }
  };

  private async confirmarCotizacion(id: number, numero_documento: number) {
    try {
      const response = await this.axiosInstance.post<boolean>('/confirm', {
        claim_id: id,
        order_id: id,
        sales_document_id: numero_documento,
        pos_code: process.env.YAPP_POS_CODE,
      });

      return response.data;
    } catch (error: any) {
      throw this.handleServiceError(error);
    }
  }

  private async obtenerVoucher(id: number): Promise<VoucherResponse> {
    try {
      const response = await this.axiosInstance.get(`/voucher?claim_id=${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleServiceError(error);
    }
  }

  private generarDocumentos(payload: ConfirmarSeguroComplementarioPayload): Array<Boleta | GuiaDeDespacho> {
    const { cliente, cotizacion, id_interno, orden } = payload;

    const tiene_delivery = orden.precio_delivery > 0;

    const documentos: Array<Boleta | GuiaDeDespacho> = [];

    const productos_sin_cobertura: Producto[] = [];
    const productos_con_cobertura: Producto[] = [];

    orden.productos.forEach((producto) => {
      const tiene_cotizacion = cotizacion.productos.some(
        ({ sku, lote }) => sku === producto.sku && lote === producto.lote
      );

      if (tiene_cotizacion) {
        productos_con_cobertura.push({
          cantidad: producto.cantidad,
          descuento: 0,
          precio_unitario: producto.precio_unitario,
          titulo: `${producto.sku} ${producto.nombre} ${producto.lote}`,
        });
      } else {
        productos_sin_cobertura.push({
          cantidad: producto.cantidad,
          descuento: 0,
          precio_unitario: producto.precio_unitario,
          titulo: `${producto.sku} ${producto.nombre} ${producto.lote}`,
        });
      }
    });

    if (productos_sin_cobertura.length > 0 || tiene_delivery) {
      documentos.push({
        comentario: `Orden: ${id_interno}, Cliente: ${cliente.nombre}`,
        id_interno,
        productos: productos_sin_cobertura,
        proveedor: 'Bsale',
        tipo_documento: 'Boleta',
        tipo_pago: 'Debito',
        ...(tiene_delivery && { delivery: { precio_unitario: orden.precio_delivery, titulo: 'Envío' } }),
      });
    }

    if (productos_con_cobertura.length > 0) {
      documentos.push({
        cliente: {
          actividad: '',
          comuna: 'La Condes',
          correo: '',
          direccion: 'Asturias 350, Las Condes, Región Metropolitana, Chile',
          nombre: 'Servicios de Información Yapp SPA',
          region: 'Santiago',
          rut: '76.860.575-0',
        },
        comentario: `Orden: ${id_interno}, Cliente: ${cliente.nombre}`,
        direccion_destino: {
          calle: 'Av. Príncipe de Gales',
          comuna: 'La Reina',
          nombre_receptor: 'Servicios de Información Yapp SPA',
          numero_calle: '6273',
          numero_domicilio: '',
          pais: 'Chile',
          referencias: '',
          region: 'Región Metropolitana',
          tipo_domicilio: '',
        },
        id_interno,
        productos: productos_con_cobertura,
        proveedor: 'Bsale',
        tipo_documento: this.generarTipoDeDocumento(cotizacion.tipo_documento),
        tipo_guia: 2,
      });
    }

    return documentos;
  }

  private async generarVoucherPDF(voucher: VoucherResponse, id: string): Promise<string> {
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const page = pdfDoc.addPage(PageSizes.A6);
      const { height } = page.getSize();

      const top = height - 25;
      const black_color = rgb(0, 0, 0);

      page.drawText('Voucher Seguro Complementario', {
        x: 20,
        y: top,
        size: 12,
        font: fontBold,
        color: black_color,
      });

      const informacion_general = [
        { label: 'Número de operación:', value: voucher.request_id },
        { label: 'RUT compañia:', value: voucher.insurance_company_identity_number },
        { label: 'Compañia de seguros:', value: voucher.insurance_company_name },
        { label: 'RUT cliente:', value: voucher.beneficiary_identity_number },
        { label: 'Cliente:', value: voucher.beneficiary_name },
        { label: 'Poliza:', value: voucher.policy },
        { label: 'Cap:', value: voucher.cap },
        { label: 'Copago', value: voucher.copay },
        { label: 'Contribución seguro:', value: voucher.insurance_contribution },
        { label: 'Reembolso:', value: voucher.reimbursement },
        { label: 'Poliza deducible:', value: voucher.policy_deductible },
        { label: 'Deducible de venta:', value: voucher.sales_deductible },
        { label: 'Documento de venta:', value: voucher.sales_document_id },
      ];

      let posicion = top - 10;

      for (const el of informacion_general) {
        page.drawText(`${el.label} ${el.value}`, {
          x: 20,
          y: posicion,
          size: 8,
          font,
          color: black_color,
        });

        posicion = posicion - 8;
      }

      posicion = posicion - 10;

      for (const product of voucher.products) {
        const informacion_productos = [
          { label: 'Cantidad:', value: product.quantity },
          { label: 'Cap:', value: product.cap },
          { label: 'Copago:', value: product.copay },
          { label: 'Contribución seguro:', value: product.insurance_contribution },
          { label: 'Reembolso:', value: product.reimbursement },
          { label: 'Poliza deducible:', value: product.policy_deductible },
          { label: 'Precio:', value: product.price },
          { label: 'Deducible de venta:', value: product.sales_deductible },
          { label: 'Descuento:', value: product.discount },
        ];

        page.drawText(`Nombre: ${product.name} ${product.sku}`, {
          x: 20,
          y: posicion,
          size: 8,
          font: fontBold,
          color: black_color,
        });
        posicion = posicion - 8;

        for (const info of informacion_productos) {
          page.drawText(`${info.label} ${info.value}`, {
            x: 20,
            y: posicion,
            size: 8,
            font,
            color: black_color,
          });
          posicion = posicion - 8;
        }

        posicion = posicion - 10;
      }

      const pdfBytes = await pdfDoc.save();

      const bucket = 'seguro-complementario-documents';
      const fileName = `yapp/${voucher.beneficiary_identity_number}-${id}.pdf`;

      await this.s3Client.send(
        new PutObjectCommand({ Bucket: bucket, Key: fileName, Body: pdfBytes, ContentType: 'application/pdf' })
      );

      return `https://${bucket}.s3.amazonaws.com/${fileName}`;
    } catch (error: any) {
      throw this.handleServiceError(error);
    }
  }

  private generarTipoDeDocumento(tipo_documento: string): 'Guia de despacho' {
    if (tipo_documento === 'dispatch_note') return 'Guia de despacho';
    if (tipo_documento === 'bill' && process.env.ENV === 'PROD') return 'Guia de despacho';
    if (tipo_documento === 'bill' && process.env.ENV === 'QA') return 'Guia de despacho';

    throw new ApiResponse(
      HttpCodes.BAD_REQUEST,
      tipo_documento,
      'Error al intentar generar un documento, sin soporte.'
    );
  }

  private handleServiceError(error: AxiosError): { data: any; status?: number; statusText?: string } {
    if (error.response) {
      const response = error.response;

      return { data: response.data, status: response.status, statusText: response.statusText };
    } else {
      return { data: JSON.stringify(error, null, 2), statusText: 'Unknown error occurred' };
    }
  }

  public confirmarProductosSinCobertura = async (
    payload: ConfirmarProductosSinCoberturaPayload
  ): Promise<ConfirmarProductosSinCoberturaResponse> => {
    try {
      const { id_interno } = payload;

      const documentos_a_generar = this.generarDocumentos(payload);
      const documentos_generados: Documento[] = [];

      for (const documento of documentos_a_generar) {
        if (documento.tipo_documento === 'Boleta') {
          const boleta = await this.documentosTributariosService.generarBoleta({
            accion: 'generar-documento-tributario',
            payload: documento,
            origen: 'yapp-service',
          });
          if (!boleta) {
            console.log('Ocurrio un error al generar boleta: ', JSON.stringify({ payload, response: boleta }, null, 2));
            throw new Error('Ocurrio un error al generar boleta.');
          }
          documentos_generados.push({
            destinatario: 'Cliente',
            documento_referencia: boleta.documento_referencia,
            emisor: boleta.emisor,
            fecha_emision: boleta.fecha_emision,
            numero_documento: boleta.numero_documento,
            timbre_electronico: boleta.timbre_electronico,
            tipo_documento: boleta.tipo_documento,
            url_documento: boleta.url_documento,
          });
        }
      }

      return { documentos: documentos_generados, id_interno };
    } catch (error: any) {
      throw this.handleServiceError(error);
    }
  };

  public confirmarProductosConCobertura = async (payload: ConfirmarProductosSinCoberturaPayload) => {
    try {
      const { cotizacion, id_interno } = payload;

      const documentos_a_generar = this.generarDocumentos(payload);
      const documentos_generados: Documento[] = [];
      let numero_documento_cliente = 0;

      for (const documento of documentos_a_generar) {
        if (documento.tipo_documento === 'Guia de despacho') {
          const guia_de_despacho = await this.documentosTributariosService.generarGuiaDeDespacho({
            accion: 'generar-documento-tributario',
            payload: documento,
            origen: 'yapp-service',
          });

          if (!guia_de_despacho) {
            console.log(
              'Ocurrio un error al generar guia de despacho: ',
              JSON.stringify({ payload, response: guia_de_despacho }, null, 2)
            );
            throw new Error('Ocurrio un error al generar guia de despacho.');
          }

          documentos_generados.push({
            destinatario: 'Seguro Complementario',
            documento_referencia: guia_de_despacho.documento_referencia,
            emisor: guia_de_despacho.emisor,
            fecha_emision: guia_de_despacho.fecha_emision,
            numero_documento: guia_de_despacho.numero_documento,
            timbre_electronico: guia_de_despacho.timbre_electronico,
            tipo_documento: guia_de_despacho.tipo_documento,
            url_documento: guia_de_despacho.url_documento,
          });

          if (numero_documento_cliente === 0) {
            numero_documento_cliente = Number(guia_de_despacho.numero_documento);
          }
        }
      }

      const numero_cotizacion = Number(cotizacion.id);
      const cotizacon_confirmada = await this.confirmarCotizacion(numero_cotizacion, numero_documento_cliente);
      if (!cotizacon_confirmada) {
        console.log(
          'Error al confirmar cotizacion: ',
          JSON.stringify(
            { payload: { numero_cotizacion, numero_documento_cliente }, response: { cotizacon_confirmada } },
            null,
            2
          )
        );
        throw new Error('Error al confirmar cotizacion.');
      }

      const voucher = await this.obtenerVoucher(numero_cotizacion);
      if (!voucher) {
        console.log(
          'Error al obtener voucher: ',
          JSON.stringify({ payload: { numero_cotizacion }, response: { voucher } }, null, 2)
        );
        throw new Error('Error al obtener voucher.');
      }

      const url_voucher = await this.generarVoucherPDF(voucher, cotizacion.id);
      if (!url_voucher) {
        console.log(
          'Error generar voucher pdf: ',
          JSON.stringify({ payload: { voucher }, response: { url_voucher } }, null, 2)
        );
        throw new Error('Error generar voucher pdf.');
      }

      return { documentos: documentos_generados, id_interno, url_voucher };
    } catch (error: any) {
      throw this.handleServiceError(error);
    }
  };
}
