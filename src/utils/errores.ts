export class ErrorDeValidacion extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorDeValidacion';
  }
}

export class ErrorDeProcesamiento extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorDeProcesamiento';
  }
}