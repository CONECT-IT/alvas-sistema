Feature: Registrar Lead
  Como Asesor Comercial o Administrador
  Quiero registrar nuevos leads en el sistema
  Para gestionar oportunidades de venta

  Scenario: Admin registra lead y lo asigna a un asesor especifico
    Given un administrador autenticado
    When el admin registra un lead "Luis" con email "luis@example.com" tipo "COMPRA" asignado a "asesor-2"
    Then el lead se crea asignado al asesor "asesor-2"

  Scenario: Asesor registra lead propio
    Given un asesor autenticado
    When el asesor registra un lead "Maria" con email "maria@example.com" tipo "VENTA"
    Then el lead se crea asignado al asesor autenticado

  Scenario: Asesor registra lead tipo COMPRA con propiedad de interes disponible
    Given un asesor autenticado
    And una propiedad disponible para compra
    When el asesor registra un lead "Pedro" con email "pedro@example.com" tipo "COMPRA" interesado en "prop-001"
    Then el lead se crea con la propiedad de interes vinculada
