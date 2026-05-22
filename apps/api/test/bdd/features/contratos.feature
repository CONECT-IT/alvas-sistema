Feature: Gestion de Contratos
  Como Asesor Comercial
  Quiero crear, firmar y cancelar contratos
  Para formalizar las ventas de propiedades

  Scenario: Crear contrato en estado borrador desde un lead
    Given un lead "lead-001" y una propiedad "prop-001"
    When el asesor crea un contrato para el lead
    Then el contrato se crea en estado "BORRADOR" con el lead vinculado

  Scenario: Firmar contrato lo pasa a vigente y crea el cliente
    Given un contrato en estado "BORRADOR" vinculado a un lead
    When el asesor firma el contrato
    Then el contrato pasa a estado "VIGENTE" y el cliente queda creado

  Scenario: Cancelar contrato en estado borrador
    Given un contrato en estado "BORRADOR"
    When el asesor cancela el contrato
    Then el contrato pasa a estado "CANCELADO"

  Scenario: Cancelar contrato en estado vigente
    Given un contrato en estado "VIGENTE"
    When el asesor cancela el contrato
    Then el contrato pasa a estado "CANCELADO"
