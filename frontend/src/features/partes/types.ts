export type TipoParte =
  | 'ACCIDENTE'
  | 'INCENDIO_INDUSTRIAL'
  | 'INCENDIO_FORESTAL'
  | 'INCENDIO_VIVIENDA'
  | 'INCENDIO_VEHICULAR'
  | 'SERVICIOS_ESPECIALES_CAPACITACION'
  | 'RESCATE'
  | 'MATERIALES_PELIGROSOS'
  | 'SERVICIOS_ESPECIALES'
  | 'SERVICIOS_FALSA_ALARMA'

export type ParteEstado = 'BORRADOR' | 'FINALIZADO'
export type TipoZona = 'URBANA' | 'RURAL'
export type TipoChoque = 'FRONTAL' | 'LATERAL' | 'TRASERO' | 'MULTIPLES_LUGARES'
export type TipoDerrame = 'SOLIDO' | 'LIQUIDO' | 'GASEOSO'
export type SubtipoIndustrial =
  | 'ALIMENTACION' | 'AUTOMOTRIZ' | 'METALURGICA' | 'QUIMICA' | 'PETROQUIMICA' | 'TEXTIL' | 'OTRO'
export type CausaIncendio = 'NEGLIGENCIA' | 'INTENCIONAL' | 'NATURAL' | 'DESCONOCIDA'
export type NivelCapacitacion = 'CUARTEL' | 'FEDERATIVA' | 'NACIONAL' | 'INTERNACIONAL' | 'REGIONAL' | 'OTRA'
export type SubtipoRescate = 'ANIMAL' | 'PERSONA' | 'OTRO'
export type TipoEventoMatPeligroso = 'ESCAPE' | 'DERRAME' | 'EXPLOSION'
export type SituacionExplosion = 'DERRAME' | 'INCENDIO' | 'INDETERMINADO'
export type SubtipoServicioEspecial = 'SERVICIO' | 'REPRESENTACION' | 'PREVENCION'

export interface Localizacion {
  localidad: string | null
  distrito: string | null
  calleRuta: string | null
  numeroKm: string | null
  entreCalles: string | null
  tipoZona: TipoZona | null
}

export interface Solicitante {
  nombre: string | null
  apellido: string | null
  dni: string | null
  telefono: string | null
}

export interface DatosPrimordiales {
  participoComisionDirectiva: boolean | null
  participoComisionDetalle: string | null
  horaLlamado: string | null
  horaSalida: string | null
  horaArribo: string | null
  horaTerminada: string | null
  horaRegresoCuartel: string | null
  aCargo: string | null
  operador: string | null
  movilNro: string | null
  chofer: string | null
  apoyoMovilNro: string | null
  choferApoyo: string | null
  dotacionMovil: string | null
  dotacionApoyoMovil: string | null
}

export interface SuperficieAfectada {
  noEvacuo: boolean | null
  kilometros: number | null
  metros: number | null
  hectareas: number | null
  detalle: string | null
}

export interface DatosAccidente {
  climaLluvia: boolean | null
  climaNeblina: boolean | null
  climaSoleado: boolean | null
  climaVentoso: boolean | null
  climaNoche: boolean | null
  climaOtro: boolean | null
  climaOtroDetalle: string | null
  causaChoque: boolean | null
  tipoChoque: TipoChoque | null
  causaDespiste: boolean | null
  causaDerrame: boolean | null
  tipoDerrame: TipoDerrame | null
  causaVuelco: boolean | null
}

export interface DatosIncendioIndustrial {
  subtipoIndustrial: SubtipoIndustrial | null
  subtipoIndustrialOtroDetalle: string | null
  causaIncendio: CausaIncendio | null
}

export interface DatosIncendioForestalLugar {
  lugarCampo: boolean | null
  lugarPastizal: boolean | null
  lugarArbustalMatorral: boolean | null
  lugarInterfase: boolean | null
  lugarBasural: boolean | null
  lugarOtro: boolean | null
  lugarOtroDetalle: string | null
}

export interface DatosIncendioVivienda {
  seguroCompania: string | null
  seguroPoliza: string | null
  seguroVencimiento: string | null
  tipoLugarCasa: boolean | null
  tipoLugarDepto: boolean | null
  tipoLugarCasilla: boolean | null
  tipoLugarRancho: boolean | null
  tipoLugarMultifuncional: boolean | null
  tipoLugarOtro: boolean | null
  tipoLugarOtroDetalle: string | null
  techoMaderaPaja: boolean | null
  techoYeso: boolean | null
  techoTejas: boolean | null
  techoChapaMetalica: boolean | null
  techoChapaCarton: boolean | null
  aberturaMadera: boolean | null
  aberturaAceroHierro: boolean | null
  aberturaAluminio: boolean | null
  aberturaPlastico: boolean | null
  aberturaOtro: boolean | null
  aberturaOtroDetalle: string | null
}

export interface DatosCapacitacion {
  nivelCapacitacion: NivelCapacitacion | null
  nivelCapacitacionOtroDetalle: string | null
  tipoIncendioEstructural: boolean | null
  tipoIncendioForestal: boolean | null
  tipoUsarBrec: boolean | null
  tipoGrimpRtc: boolean | null
  tipoMatPel: boolean | null
  tipoPsicologiaEmergencia: boolean | null
  tipoRescateAcuatico: boolean | null
  tipoRescateVehicular: boolean | null
  tipoSocorrismo: boolean | null
  tipoEscuelaCadetes: boolean | null
  tipoComandoIncidente: boolean | null
  tipoOtra: boolean | null
  tipoOtraDetalle: string | null
  detalleLibre: string | null
  diasCapacitacion: number | null
  horasCapacitacion: number | null
}

export interface DatosRescate {
  subtipo: SubtipoRescate | null
  subtipoOtroDetalle: string | null
  lugarCasas: boolean | null
  lugarEdificio: boolean | null
  lugarArbol: boolean | null
  lugarRios: boolean | null
  lugarPileta: boolean | null
  lugarLagos: boolean | null
  lugarOtro: boolean | null
  lugarOtroDetalle: string | null
}

export interface DatosMaterialesPeligrosos {
  sustanciasInvolucradas: string | null
  tipoEvento: TipoEventoMatPeligroso | null
  accMatQuemaControlada: boolean | null
  accMatVenteo: boolean | null
  accMatDilucionVapores: boolean | null
  accMatTrasvase: boolean | null
  accMatOtra: boolean | null
  accMatOtraDetalle: string | null
  accPersEvacuacion: boolean | null
  accPersDescontaminacion: boolean | null
  accPersConfinamiento: boolean | null
  accPersSinAccion: boolean | null
  accPersOtra: boolean | null
  accPersOtraDetalle: string | null
  situacionQueOcurrioPrimero: SituacionExplosion | null
}

export interface DatosServiciosEspeciales {
  subtipo: SubtipoServicioEspecial | null
  servOtrasFuerzas: boolean | null
  servEntidadesGubernamentales: boolean | null
  servEmpresaPrivada: boolean | null
  servDetalle: string | null
  repDesfile: boolean | null
  repHonoresFunebres: boolean | null
  repAniversarios: boolean | null
  repEventosPublicos: boolean | null
  repEventosPrivados: boolean | null
  repCeremonias: boolean | null
  repOtra: boolean | null
  repOtraDetalle: string | null
  prevAterrizaje: boolean | null
  prevDespegues: boolean | null
  prevEventos: boolean | null
  prevFiesta: boolean | null
  prevOtra: boolean | null
  prevOtraDetalle: string | null
}

export interface DatosFalsaAlarma {
  horaComunicacion: string | null
  tipoIncendioComunicado: string | null
  calle: string | null
  movilPolicialNro: string | null
  aCargoDe: string | null
  movilArriboNro: string | null
  horaArribo: string | null
  kilometrosRecorridos: number | null
  litrosCombustible: number | null
}

export interface PersonaDamnificada {
  id?: number
  rol: string | null
  nombreApellido: string | null
  dni: string | null
  telefono: string | null
  domicilio: string | null
}

export interface EntidadIntervino {
  id?: number
  filaPrincipal: boolean
  seConstato: boolean | null
  entidad: string | null
  movilNro: string | null
  aCargo: string | null
}

export interface Vehiculo {
  id?: number
  tipo: string | null
  marca: string | null
  dominio: string | null
  modelo: string | null
  anio: number | null
  aseguradora: string | null
  poliza: string | null
}

// Cuerpo grande del formulario: se usa tanto para crear como para editar.
export interface ParteFormData {
  tipoParte: TipoParte
  numeroRuba: string
  fechaHecho: string
  cuerpoParticipante: string
  ampliatorio: string
  localizacion: Localizacion
  solicitante: Solicitante
  datosPrimordiales: DatosPrimordiales
  superficieAfectada: SuperficieAfectada
  datosAccidente: DatosAccidente
  datosIncendioIndustrial: DatosIncendioIndustrial
  datosIncendioForestalLugar: DatosIncendioForestalLugar
  datosIncendioVivienda: DatosIncendioVivienda
  datosCapacitacion: DatosCapacitacion
  datosRescate: DatosRescate
  datosMaterialesPeligrosos: DatosMaterialesPeligrosos
  datosServiciosEspeciales: DatosServiciosEspeciales
  datosFalsaAlarma: DatosFalsaAlarma
  personasDamnificadas: PersonaDamnificada[]
  entidadesIntervino: EntidadIntervino[]
  vehiculos: Vehiculo[]
}

export interface Parte extends ParteFormData {
  id: number
  tituloParte: string
  codigoFormulario: string
  // Correlativo mensual asignado por el backend al finalizar; null mientras
  // el parte está en BORRADOR (ver ParteService#finalizar en el backend).
  numeroParte: number | null
  estado: ParteEstado
  creadoPorId: number
  creadoPorNombre: string
  creadoEn: string
  actualizadoEn: string
  puedeEditar: boolean
  textoFalsaAlarmaGenerado: string | null
}

export interface ParteResumen {
  id: number
  tipoParte: TipoParte
  tituloParte: string
  codigoFormulario: string
  numeroParte: number | null
  numeroRuba: string | null
  fechaHecho: string | null
  estado: ParteEstado
  creadoPorNombre: string
  creadoEn: string
}
