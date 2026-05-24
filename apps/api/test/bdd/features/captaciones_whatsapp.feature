Feature: Captaciones WhatsApp
  Como equipo comercial de ALVAS
  Quiero revisar captaciones recibidas por WhatsApp antes de crear leads
  Para deduplicar prospectos y convertir solo oportunidades validas

  Scenario: WhatsApp crea una captacion pendiente
    When WhatsApp registra una captacion de comprador "Carlos Comprador"
    Then la captacion queda en estado "PENDIENTE"

  Scenario: Revisar una captacion pendiente
    Given una captacion pendiente de WhatsApp
    When el equipo comercial revisa la captacion
    Then la captacion queda en estado "REVISADA"

  Scenario: Marcar captacion como duplicada
    Given una captacion pendiente de WhatsApp
    When el equipo comercial marca la captacion como duplicada por "Telefono ya existe"
    Then la captacion queda en estado "DUPLICADA"

  Scenario: Rechazar captacion sin intencion comercial
    Given una captacion pendiente de WhatsApp
    When el equipo comercial rechaza la captacion por "Sin intencion comercial"
    Then la captacion queda en estado "RECHAZADA"

  Scenario: Convertir captacion compradora a lead
    Given una captacion pendiente de WhatsApp
    When el equipo comercial convierte la captacion asignada a "asesor-1"
    Then se crea un lead desde la captacion
    And la captacion queda en estado "CONVERTIDA"

  Scenario: Captacion vendedora crea propiedad preliminar
    Given una captacion vendedora pendiente de WhatsApp
    When el equipo comercial convierte la captacion asignada a "asesor-1"
    Then se crea un lead desde la captacion
    And se crea una propiedad preliminar desde la captacion
