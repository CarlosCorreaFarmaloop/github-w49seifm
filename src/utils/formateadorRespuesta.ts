import { APIGatewayProxyResult } from 'aws-lambda';

export function formatearRespuestaApi(
  codigoEstado: number,
  cuerpo: Record<string, any>
): APIGatewayProxyResult {
  return {
    statusCode: codigoEstado,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(cuerpo)
  };
}