import type { ParteFormData, TipoParte } from './types'

// Los 10 tipos de parte, en el orden oficial (1 a 10). El selector de
// tipo y el listado respetan este orden.
export const TIPOS_PARTE: { tipo: TipoParte; titulo: string; codigoFormulario: string }[] = [
  { tipo: 'ACCIDENTE', titulo: 'Accidente', codigoFormulario: 'FO-01 A' },
  { tipo: 'INCENDIO_INDUSTRIAL', titulo: 'Incendio Industrial', codigoFormulario: 'FO-01 B' },
  { tipo: 'INCENDIO_FORESTAL', titulo: 'Incendio Forestal', codigoFormulario: 'FO-01 B' },
  { tipo: 'INCENDIO_VIVIENDA', titulo: 'Incendio Vivienda', codigoFormulario: 'FO-01 B' },
  { tipo: 'INCENDIO_VEHICULAR', titulo: 'Incendio Vehicular', codigoFormulario: 'FO-01 B' },
  { tipo: 'SERVICIOS_ESPECIALES_CAPACITACION', titulo: 'Servicios Especiales – Capacitación', codigoFormulario: 'FO-01 D' },
  { tipo: 'RESCATE', titulo: 'Rescate', codigoFormulario: 'FO-01 C' },
  { tipo: 'MATERIALES_PELIGROSOS', titulo: 'Materiales Peligrosos', codigoFormulario: 'FO-01 F' },
  { tipo: 'SERVICIOS_ESPECIALES', titulo: 'Servicios Especiales (Servicio / Representación / Prevención)', codigoFormulario: 'FO-01 D' },
  { tipo: 'SERVICIOS_FALSA_ALARMA', titulo: 'Servicios Falsa Alarma', codigoFormulario: 'FO-01 D' },
]

export const tituloDeTipo = (tipo: TipoParte): string =>
  TIPOS_PARTE.find((t) => t.tipo === tipo)?.titulo ?? tipo

// Tipos que muestran el bloque común "Ampliatorio" (textarea libre).
export const TIPOS_CON_AMPLIATORIO: TipoParte[] = [
  'ACCIDENTE', 'INCENDIO_INDUSTRIAL', 'INCENDIO_FORESTAL', 'INCENDIO_VEHICULAR',
  'SERVICIOS_ESPECIALES_CAPACITACION', 'RESCATE', 'MATERIALES_PELIGROSOS',
]

// Tipos que muestran la tabla de vehículos.
export const TIPOS_CON_VEHICULOS: TipoParte[] = ['ACCIDENTE', 'INCENDIO_VEHICULAR']

// Tipos que muestran "Datos de la superficie afectada".
export const TIPOS_CON_SUPERFICIE_AFECTADA: TipoParte[] = [
  'INCENDIO_INDUSTRIAL', 'INCENDIO_FORESTAL', 'INCENDIO_VIVIENDA', 'INCENDIO_VEHICULAR', 'MATERIALES_PELIGROSOS',
]

export const NIVELES_CAPACITACION = ['CUARTEL', 'FEDERATIVA', 'NACIONAL', 'INTERNACIONAL', 'REGIONAL', 'OTRA'] as const
export const SUBTIPOS_INDUSTRIAL = ['ALIMENTACION', 'AUTOMOTRIZ', 'METALURGICA', 'QUIMICA', 'PETROQUIMICA', 'TEXTIL', 'OTRO'] as const
export const CAUSAS_INCENDIO = ['NEGLIGENCIA', 'INTENCIONAL', 'NATURAL', 'DESCONOCIDA'] as const
export const SUBTIPOS_RESCATE = ['ANIMAL', 'PERSONA', 'OTRO'] as const
export const TIPOS_EVENTO_MAT_PELIGROSO = ['ESCAPE', 'DERRAME', 'EXPLOSION'] as const
export const SITUACIONES_EXPLOSION = ['DERRAME', 'INCENDIO', 'INDETERMINADO'] as const
export const SUBTIPOS_SERVICIO_ESPECIAL = ['SERVICIO', 'REPRESENTACION', 'PREVENCION'] as const

// `form` en ParteFormPage puede venir de getParte() y traer campos que no
// son parte del request (id, estado, numeroParte, etc.). Esto reconstruye
// el objeto con exactamente las claves de ParteFormData antes de mandarlo
// al backend, para no filtrar esos campos extra en el body del POST/PUT.
export const aRequestBody = (form: ParteFormData): ParteFormData => ({
  tipoParte: form.tipoParte,
  numeroRuba: form.numeroRuba,
  fechaHecho: form.fechaHecho,
  cuerpoParticipante: form.cuerpoParticipante,
  ampliatorio: form.ampliatorio,
  localizacion: form.localizacion,
  solicitante: form.solicitante,
  datosPrimordiales: form.datosPrimordiales,
  superficieAfectada: form.superficieAfectada,
  datosAccidente: form.datosAccidente,
  datosIncendioIndustrial: form.datosIncendioIndustrial,
  datosIncendioForestalLugar: form.datosIncendioForestalLugar,
  datosIncendioVivienda: form.datosIncendioVivienda,
  datosCapacitacion: form.datosCapacitacion,
  datosRescate: form.datosRescate,
  datosMaterialesPeligrosos: form.datosMaterialesPeligrosos,
  datosServiciosEspeciales: form.datosServiciosEspeciales,
  datosFalsaAlarma: form.datosFalsaAlarma,
  personasDamnificadas: form.personasDamnificadas,
  entidadesIntervino: form.entidadesIntervino,
  vehiculos: form.vehiculos,
})

export const filaInicialPersona = (rol: string) => ({ rol, nombreApellido: '', dni: '', telefono: '', domicilio: '' })
export const filaInicialEntidadPrincipal = () =>
  ({ filaPrincipal: true, seConstato: false, entidad: '', movilNro: '', aCargo: '' })
export const filaInicialEntidad = () =>
  ({ filaPrincipal: false, seConstato: null, entidad: '', movilNro: '', aCargo: '' })
export const filaInicialVehiculo = () =>
  ({ tipo: '', marca: '', dominio: '', modelo: '', anio: null, aseguradora: '', poliza: '' })

// Formulario vacío para un tipo dado: filas fijas sugeridas en Personas
// damnificadas (Propietario/Víctima) y la fila especial de Entidades.
export const crearFormularioVacio = (tipoParte: TipoParte): ParteFormData => ({
  tipoParte,
  numeroRuba: '',
  fechaHecho: '',
  cuerpoParticipante: '',
  ampliatorio: '',
  localizacion: { localidad: '', distrito: '', calleRuta: '', numeroKm: '', entreCalles: '', tipoZona: null },
  solicitante: { nombre: '', apellido: '', dni: '', telefono: '' },
  datosPrimordiales: {
    participoComisionDirectiva: false, participoComisionDetalle: '',
    horaLlamado: '', horaSalida: '', horaArribo: '', horaTerminada: '', horaRegresoCuartel: '',
    aCargo: '', operador: '', movilNro: '', chofer: '', apoyoMovilNro: '', choferApoyo: '',
    dotacionMovil: '', dotacionApoyoMovil: '',
  },
  superficieAfectada: { noEvacuo: false, kilometros: null, metros: null, hectareas: null, detalle: '' },
  datosAccidente: {
    climaLluvia: false, climaNeblina: false, climaSoleado: false, climaVentoso: false, climaNoche: false,
    climaOtro: false, climaOtroDetalle: '',
    causaChoque: false, tipoChoque: null, causaDespiste: false, causaDerrame: false, tipoDerrame: null, causaVuelco: false,
  },
  datosIncendioIndustrial: { subtipoIndustrial: null, subtipoIndustrialOtroDetalle: '', causaIncendio: null },
  datosIncendioForestalLugar: {
    lugarCampo: false, lugarPastizal: false, lugarArbustalMatorral: false, lugarInterfase: false,
    lugarBasural: false, lugarOtro: false, lugarOtroDetalle: '',
  },
  datosIncendioVivienda: {
    seguroCompania: '', seguroPoliza: '', seguroVencimiento: '',
    tipoLugarCasa: false, tipoLugarDepto: false, tipoLugarCasilla: false, tipoLugarRancho: false,
    tipoLugarMultifuncional: false, tipoLugarOtro: false, tipoLugarOtroDetalle: '',
    techoMaderaPaja: false, techoYeso: false, techoTejas: false, techoChapaMetalica: false, techoChapaCarton: false,
    aberturaMadera: false, aberturaAceroHierro: false, aberturaAluminio: false, aberturaPlastico: false,
    aberturaOtro: false, aberturaOtroDetalle: '',
  },
  datosCapacitacion: {
    nivelCapacitacion: null, nivelCapacitacionOtroDetalle: '',
    tipoIncendioEstructural: false, tipoIncendioForestal: false, tipoUsarBrec: false, tipoGrimpRtc: false,
    tipoMatPel: false, tipoPsicologiaEmergencia: false, tipoRescateAcuatico: false, tipoRescateVehicular: false,
    tipoSocorrismo: false, tipoEscuelaCadetes: false, tipoComandoIncidente: false, tipoOtra: false, tipoOtraDetalle: '',
    detalleLibre: '', diasCapacitacion: null, horasCapacitacion: null,
  },
  datosRescate: {
    subtipo: null, subtipoOtroDetalle: '',
    lugarCasas: false, lugarEdificio: false, lugarArbol: false, lugarRios: false, lugarPileta: false,
    lugarLagos: false, lugarOtro: false, lugarOtroDetalle: '',
  },
  datosMaterialesPeligrosos: {
    sustanciasInvolucradas: '', tipoEvento: null,
    accMatQuemaControlada: false, accMatVenteo: false, accMatDilucionVapores: false, accMatTrasvase: false,
    accMatOtra: false, accMatOtraDetalle: '',
    accPersEvacuacion: false, accPersDescontaminacion: false, accPersConfinamiento: false, accPersSinAccion: false,
    accPersOtra: false, accPersOtraDetalle: '',
    situacionQueOcurrioPrimero: null,
  },
  datosServiciosEspeciales: {
    subtipo: null,
    servOtrasFuerzas: false, servEntidadesGubernamentales: false, servEmpresaPrivada: false, servDetalle: '',
    repDesfile: false, repHonoresFunebres: false, repAniversarios: false, repEventosPublicos: false,
    repEventosPrivados: false, repCeremonias: false, repOtra: false, repOtraDetalle: '',
    prevAterrizaje: false, prevDespegues: false, prevEventos: false, prevFiesta: false, prevOtra: false, prevOtraDetalle: '',
  },
  datosFalsaAlarma: {
    horaComunicacion: '', tipoIncendioComunicado: '', calle: '', movilPolicialNro: '', aCargoDe: '',
    movilArriboNro: '', horaArribo: '', kilometrosRecorridos: null, litrosCombustible: null,
  },
  personasDamnificadas: [filaInicialPersona('Propietario'), filaInicialPersona('Víctima')],
  entidadesIntervino: [filaInicialEntidadPrincipal()],
  vehiculos: [],
})
