import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

import {
  ConfirmarProductosSinCoberturaResponse,
  SeguroComplementarioResponse,
} from '../../../core/modules/seguroComplementario/application/interface';
import {
  BillingType,
  ISeguroComplementarioInputService,
  NotificacionDeConfirmacion,
  NotificarProductosSinCobertura,
} from './interface';
import { ApiResponse, HttpCodes } from '../../../core/modules/seguroComplementario/application/api.response';

export class SeguroComplementarioInputService implements ISeguroComplementarioInputService {
  private readonly eventBridgeClient: EventBridgeClient;
  private readonly eventBusName = 'arn:aws:events:us-east-1:069526102702:event-bus/default';

  constructor() {
    this.eventBridgeClient = new EventBridgeClient({ region: 'us-east-1' });
  }

  public async notificarConfirmacion(payload: SeguroComplementarioResponse) {
    try {
      const eventSource = `ordenes_sqs_${process.env.ENV?.toLowerCase() as string}`;

      const notificacion = this.generarNotificacionDeConfirmacion(payload);

      const params = new PutEventsCommand({
        Entries: [
          {
            Detail: JSON.stringify(notificacion),
            DetailType: 'Notificar confirmacion de seguro complementario.',
            EventBusName: this.eventBusName,
            Source: eventSource,
            Time: new Date(),
          },
        ],
      });

      const response = await this.eventBridgeClient.send(params);

      if (response?.FailedEntryCount && response?.FailedEntryCount > 0) {
        console.error('Error al notificar seguro complementario: ', JSON.stringify({ params, response }, null, 2));
        throw new ApiResponse(HttpCodes.BAD_REQUEST, response, 'Error al notificar seguro complementario.');
      }

      console.log('Notificacion de seguro complementario emitida: ', JSON.stringify(notificacion, null, 2));

      return true;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  public async notificarProductosSinCobertura(payload: ConfirmarProductosSinCoberturaResponse) {
    try {
      const eventSource = `ordenes_sqs_${process.env.ENV?.toLowerCase() as string}`;

      const notificacion = this.generarNotificacionDeProductosSinCobertura(payload);

      const params = new PutEventsCommand({
        Entries: [
          {
            Detail: JSON.stringify(notificacion),
            DetailType: 'Notificar productos sin cobertura.',
            EventBusName: this.eventBusName,
            Source: eventSource,
            Time: new Date(),
          },
        ],
      });

      const response = await this.eventBridgeClient.send(params);

      if (response?.FailedEntryCount && response?.FailedEntryCount > 0) {
        console.error('Error al notificar productos sin cobertura: ', JSON.stringify({ params, response }, null, 2));
        throw new ApiResponse(HttpCodes.BAD_REQUEST, response, 'Error al notificar productos sin cobertura.');
      }

      console.log('Notificacion de productos sin cobertura emitida: ', JSON.stringify(notificacion, null, 2));

      return true;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  private generarNotificacionDeConfirmacion(payload: SeguroComplementarioResponse): NotificacionDeConfirmacion {
    const { documentos, id_interno, url_voucher } = payload;

    return {
      action: 'confirmar-seguro-complementario',
      body: {
        documents: documentos.map((documento) => ({
          destinatario: documento.destinatario,
          emissionDate: new Date(documento.fecha_emision),
          emitter: documento.emisor,
          number: documento.numero_documento,
          referenceDocumentId: documento.documento_referencia,
          type: documento.tipo_documento as BillingType,
          urlBilling: documento.url_documento,
          urlTimbre: documento.timbre_electronico,
        })),
        internal_id: id_interno,
        vouchers_url: [url_voucher],
      },
      origin: 'seguro-complementario',
    };
  }

  private generarNotificacionDeProductosSinCobertura(
    payload: ConfirmarProductosSinCoberturaResponse
  ): NotificarProductosSinCobertura {
    const { documentos, id_interno } = payload;

    return {
      action: 'confirmar-productos-sin-cobertura',
      body: {
        documents: documentos.map((documento) => ({
          destinatario: documento.destinatario,
          emissionDate: new Date(documento.fecha_emision),
          emitter: documento.emisor,
          number: documento.numero_documento,
          referenceDocumentId: documento.documento_referencia,
          type: documento.tipo_documento as BillingType,
          urlBilling: documento.url_documento,
          urlTimbre: documento.timbre_electronico,
        })),
        internal_id: id_interno,
      },
      origin: 'seguro-complementario',
    };
  }
}
