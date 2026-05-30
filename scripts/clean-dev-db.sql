-- Limpieza de BD local vía rollback de migraciones (más limpio que DELETE)
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS ventas_actividad;
DROP TABLE IF EXISTS ventas_citas;
DROP TABLE IF EXISTS ventas_clientes;
DROP TABLE IF EXISTS ventas_contratos;
DROP TABLE IF EXISTS ventas_leads;
DROP TABLE IF EXISTS propiedades;
DROP TABLE IF EXISTS integraciones_captaciones_pendientes;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS d1_migrations;

PRAGMA foreign_keys = ON;
