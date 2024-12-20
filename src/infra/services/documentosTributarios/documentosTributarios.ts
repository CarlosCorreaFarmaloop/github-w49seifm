import axios, { AxiosInstance, AxiosError } from 'axios';

import { GenerarBoletaPayload, BoletaResponse } from './interfaces/boleta';
import { GenerarGuiaDeDespachoPayload, GuiaDeDespachoResponse } from './interfaces/guiaDeDespacho';
import { IDocumentosTributariosService } from './interface';

export class DocumentosTributariosService implements IDocumentosTributariosService {
  axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.DOCUMENTOSTRIBUTARIOS_INPUT_API_KEY },
      baseURL: process.env.DOCUMENTOSTRIBUTARIOS_INPUT_BASEURL,
    });
  }

  public async generarBoleta(payload: GenerarBoletaPayload) {
    try {
      const url =
        process.env.ENV === 'PROD'
          ? '/prod/documentos-tributarios/generar-documento-tributario'
          : '/prod/documentos-tributarios/generar-documento-tributario';

      const response = await this.axiosInstance.post<{ data: BoletaResponse }>(url, payload);

      return response.data?.data;
    } catch (error: any) {
      throw this.handleServiceError(error);
    }
  }

  public async generarGuiaDeDespacho(payload: GenerarGuiaDeDespachoPayload) {
    try {
      const url =
        process.env.ENV === 'PROD'
          ? '/prod/documentos-tributarios/generar-documento-tributario'
          : '/prod/documentos-tributarios/generar-documento-tributario';

      const response = await this.axiosInstance.post<{ data: GuiaDeDespachoResponse }>(url, payload);
      return response.data?.data;
    } catch (error: any) {
      throw this.handleServiceError(error);
    }
  }

  private handleServiceError(error: AxiosError): { data: any; status?: number; statusText?: string } {
    if (error.response) {
      const response = error.response;

      return { data: response.data, status: response.status, statusText: response.statusText };
    } else {
      return { data: JSON.stringify(error, null, 2), statusText: 'Unknown error occurred' };
    }
  }
}
