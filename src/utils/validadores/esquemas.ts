import Joi from 'joi';

const esquemaCliente = Joi.object({
  apellido: Joi.string().required().allow(''),
  correo_electronico: Joi.string().email().required(),
  nombre: Joi.string().required(),
  telefono: Joi.string().required()
});

const esquemaProducto = Joi.object({
  cantidad: Joi.number().required().positive(),
  copago_unitario: Joi.number().required().min(0),
  deducible_unitario: Joi.number().required().min(0),
  descuento_unitario: Joi.number().required().min(0),
  lote: Joi.string().required(),
  nombre: Joi.string().required(),
  precio_unitario: Joi.number().required().positive(),
  sku: Joi.string().required()
});

const esquemaSeguroComplementario = Joi.object({
  accion: Joi.string().valid(
    'confirmar-seguro-complementario',
    'confirmar-productos-sin-cobertura',
    'confirmar-productos-con-cobertura'
  ).required(),
  payload: Joi.object({
    cliente: esquemaCliente,
    cotizacion: Joi.object({
      id: Joi.string().required(),
      productos: Joi.array().items(esquemaProducto).required(),
      tipo_documento: Joi.string().required()
    }).required(),
    id_interno: Joi.string().required(),
    orden: Joi.object({
      precio_delivery: Joi.number().required().min(0),
      productos: Joi.array().items(esquemaProducto).required()
    }).required(),
    proveedor: Joi.string().required()
  }).required()
});

export function validarEsquemaSeguroComplementario(datos: any) {
  const { error } = esquemaSeguroComplementario.validate(datos, { abortEarly: false });
  
  if (error) {
    return { 
      status: false, 
      message: error.details.map(d => d.message).join(', ')
    };
  }
  
  return { status: true, message: 'OK' };
}