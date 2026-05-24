CREATE TABLE IF NOT EXISTS `integraciones_captaciones_pendientes` (
  `id` text PRIMARY KEY NOT NULL,
  `canal` text NOT NULL,
  `origen` text NOT NULL,
  `nombre` text NOT NULL,
  `telefono` text NOT NULL,
  `email` text NOT NULL,
  `tipo` text NOT NULL,
  `estado` text NOT NULL DEFAULT 'PENDIENTE',
  `id_propiedad_interes` text,
  `metadata_json` text,
  `razon_duplicado` text,
  `creado_en` text NOT NULL,
  `actualizado_en` text NOT NULL
);
