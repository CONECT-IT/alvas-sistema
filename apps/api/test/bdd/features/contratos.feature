Feature: Gestion de Contratos
  Como Asesor Comercial
  Quiero crear y firmar contratos
  Para formalizar las ventas de propiedades

  Scenario: Crear contrato en estado borrador
    Given un cliente "cliente-001" y una propiedad "prop-001"
    When el asesor crea un contrato para el cliente
    Then el contrato se crea en estado "BORRADOR"

  Scenario: Firmar contrato lo pasa a vigente
    Given un contrato en estado "BORRADOR"
    When el asesor firma el contrato
    Then el contrato pasa a estado "VIGENTE"
