export const registrador = {
  info: (mensaje: string, contexto?: Record<string, any>) => {
    console.log(JSON.stringify({
      nivel: 'INFO',
      fecha: new Date().toISOString(),
      mensaje,
      ...contexto
    }));
  },
  
  error: (mensaje: string, contexto?: Record<string, any>) => {
    console.error(JSON.stringify({
      nivel: 'ERROR',
      fecha: new Date().toISOString(),
      mensaje,
      ...contexto
    }));
  }
};