Feature: Gestion de Propiedades
  Como Asesor Comercial
  Quiero crear y actualizar propiedades
  Para gestionar el inventario de bienes

  Scenario: Admin crea propiedad de inventario
    Given un administrador autenticado en propiedades
    When el admin crea una propiedad "Casa central" con precio 250000
    Then la propiedad se guarda con origen "ALVAS" y estado "DISPONIBLE"

  Scenario: Asesor crea propiedad preliminar para su lead vendedor
    Given un asesor autenticado en propiedades
    And un lead vendedor "lead-001" pertenece al asesor
    When el asesor crea una propiedad "Lote por captar" para su lead "lead-001"
    Then la propiedad se guarda con origen "CAPTACION" y estado "BORRADOR"

  Scenario: Asesor actualiza precio y estado de propiedad
    Given una propiedad existente "prop-001" creada por el asesor
    When el asesor actualiza el precio a 310000 y estado "DISPONIBLE"
    Then la propiedad refleja el nuevo precio y estado
