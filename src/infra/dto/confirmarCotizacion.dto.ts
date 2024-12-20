import Joi from 'joi';

const schema = Joi.object({
  cliente: Joi.object({
    apellido: Joi.string().required().allow(''),
    correo_electronico: Joi.string().required(),
    nombre: Joi.string().required(),
    telefono: Joi.string().required(),
  }).required(),
  cotizacion: Joi.object({
    id: Joi.string().required(),
    productos: Joi.array()
      .items(
        Joi.object({
          cantidad: Joi.number().required(),
          copago_unitario: Joi.number().required(),
          deducible_unitario: Joi.number().required(),
          descuento_unitario: Joi.number().required(),
          lote: Joi.string().required(),
          nombre: Joi.string().required(),
          precio_unitario: Joi.number().required(),
          sku: Joi.string().required(),
        })
      )
      .required(),
    tipo_documento: Joi.string().required(),
  }).required(),
  id_interno: Joi.string().required(),
  orden: Joi.object({
    precio_delivery: Joi.number().required(),
    productos: Joi.array()
      .items(
        Joi.object({
          cantidad: Joi.number().required(),
          lote: Joi.string().required(),
          nombre: Joi.string().required(),
          precio_unitario: Joi.number().required(),
          sku: Joi.string().required(),
        })
      )
      .required(),
  }).required(),
  proveedor: Joi.string().required(),
});

export const validarConfirmarCotizacionDto = (record: any) => {
  const { error } = schema.validate(record);

  if (error) return { status: false, message: error.message };
  return { status: true, message: 'Ok' };
};
