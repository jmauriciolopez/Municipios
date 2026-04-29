import {
  Building2,
  Zap,
  ShieldAlert,
  Leaf,
  Car,
  Shield,
  CloudRain,
  Siren,
  Trees,
  Map,
  CircleDot,
  Footprints,
  TriangleAlert,
  Construction,
  Hammer,
  Warehouse,
  LightbulbOff,
  Lightbulb,
  Cable,
  PanelTop,
  PowerOff,
  Trash2,
  Trash,
  ArchiveX,
  Bug,
  Droplets,
  Wind,
  Flame,
  Droplet,
  Waves,
  Cloud,
  Volume2,
  TrafficCone,
  Signpost,
  BadgeAlert,
  Route,
  Paintbrush,
  Ban,
  ToyBrick,
  ShieldX,
  LampFloor,
  AlertOctagon,
  Scissors,
  CircleAlert,
  CloudDrizzle,
  CloudLightning,
  Sun,
  FlameKindling,
  FireExtinguisher,
  Bomb,
  DoorOpen,
  GitBranch,
  CircleSlash,
  MapPinned,
  Baby,
  Lamp,
  Landmark,
  Sofa
} from "lucide-react";

const iconMap = {
  // =========================
  // CATEGORÍAS PRINCIPALES
  // =========================
  INFRAESTRUCTURA: Building2,
  ELECTRICO: Zap,
  SANITARIO: ShieldAlert,
  AMBIENTAL: Leaf,
  TRANSITO: Car,
  SEGURIDAD: Shield,
  CLIMATICO: CloudRain,
  EMERGENCIA: Siren,
  ARBOLADO: Trees,
  ESPACIOS_PUBLICOS: Map,

  // =========================
  // INFRAESTRUCTURA
  // =========================
  INFRA_BACHE: CircleDot,
  INFRA_VEREDA_ROTA: Footprints,
  INFRA_HUNDIMIENTO: TriangleAlert,
  INFRA_ZANJA_ABIERTA: Construction,
  INFRA_OBRA_INSEGURA: Hammer,
  INFRA_MOBILIARIO_DANADO: Warehouse,

  // =========================
  // ELÉCTRICO
  // =========================
  ELEC_LUMINARIA_APAGADA: LightbulbOff,
  ELEC_LUMINARIA_INTERMITENTE: Lightbulb,
  ELEC_POSTE_INCLINADO: TriangleAlert,
  ELEC_CABLE_EXPUESTO: Cable,
  ELEC_TABLERO_INSEGURO: PanelTop,
  ELEC_CORTE_SECTORIAL: PowerOff,

  // =========================
  // SANITARIO
  // =========================
  SAN_BASURAL: Trash2,
  SAN_CONTENEDOR_DESBORDADO: Trash,
  SAN_MICROBASURAL: ArchiveX,
  SAN_PLAGAS: Bug,
  SAN_AGUA_ESTANCADA: Droplets,
  SAN_OLOR_INTENSO: Wind,

  // =========================
  // AMBIENTAL
  // =========================
  AMB_QUEMA_RESIDUOS: Flame,
  AMB_DERRAME: Droplet,
  AMB_CONTAMINACION_AGUA: Waves,
  AMB_CONTAMINACION_AIRE: Cloud,
  AMB_RUIDO_MOLESTO: Volume2,

  // =========================
  // TRANSITO
  // =========================
  TRANS_SEMAFORO_FUERA_SERVICIO: TrafficCone,
  TRANS_SENAL_FALTANTE: Signpost,
  TRANS_SENAL_DANADA: BadgeAlert,
  TRANS_CRUCE_PELIGROSO: Route,
  TRANS_DEMARCACION_DESGASTADA: Paintbrush,
  TRANS_OBSTRUCCION_VIA: Ban,

  // =========================
  // SEGURIDAD
  // =========================
  SEG_JUEGO_ROTO: ToyBrick,
  SEG_BARANDA_DANADA: ShieldX,
  SEG_ILUMINACION_INSEGURA: LampFloor,
  SEG_CABLE_BAJO: AlertOctagon,
  SEG_ELEMENTO_PUNZANTE: Scissors,
  SEG_TAPA_FALTANTE: CircleAlert,

  // =========================
  // CLIMÁTICO
  // =========================
  CLI_INUNDACION: Waves,
  CLI_ANEGAMIENTO: CloudDrizzle,
  CLI_VIENTO_FUERTE: Wind,
  CLI_TORMENTA_SEVERA: CloudLightning,
  CLI_OLA_CALOR: Sun,

  // =========================
  // EMERGENCIA
  // =========================
  EMER_INCENDIO_BALDIO: FlameKindling,
  EMER_INCENDIO_ESTRUCTURA: FireExtinguisher,
  EMER_EXPLOSION: Bomb,
  EMER_EVACUACION: DoorOpen,
  EMER_DERRUMBE: TriangleAlert,

  // =========================
  // ARBOLADO
  // =========================
  ARB_ARBOL_RIESGO_CAIDA: Trees,
  ARB_RAMA_PELIGROSA: GitBranch,
  ARB_ARBOL_SECO: Trees,
  ARB_ARBOL_CABLEADO: Zap,
  ARB_TOCON_PELIGROSO: CircleSlash,

  // =========================
  // ESPACIOS PÚBLICOS
  // =========================
  ESP_PLAZA_ABANDONADA: MapPinned,
  ESP_JUEGO_INFANTIL_DANADO: Baby,
  ESP_FALTA_ILUMINACION: Lamp,
  ESP_FUENTE_DANADA: Landmark,
  ESP_BANCO_DANADO: Sofa,
};

export default iconMap;