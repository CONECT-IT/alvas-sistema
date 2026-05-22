-- Add id_lead column and make id_cliente nullable in ventas_contratos
ALTER TABLE ventas_contratos ADD COLUMN `id_lead` text;
-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table
-- This migration assumes the table is empty or has no data yet (dev environment)
CREATE TABLE IF NOT EXISTS `ventas_contratos_new` (
	`id` text PRIMARY KEY NOT NULL,
	`id_lead` text,
	`id_cliente` text,
	`id_propiedad` text NOT NULL,
	`fecha_inicio` text NOT NULL,
	`fecha_fin` text NOT NULL,
	`estado` text NOT NULL,
	`creado_en` text NOT NULL,
	`actualizado_en` text NOT NULL
);

INSERT INTO ventas_contratos_new (id, id_cliente, id_propiedad, fecha_inicio, fecha_fin, estado, creado_en, actualizado_en)
SELECT id, id_cliente, id_propiedad, fecha_inicio, fecha_fin, estado, creado_en, actualizado_en FROM ventas_contratos;

DROP TABLE ventas_contratos;
ALTER TABLE ventas_contratos_new RENAME TO ventas_contratos;
