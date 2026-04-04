import * as LucideIcons from 'lucide-react';
import {
  Building2, Zap, ShieldAlert, Leaf, Car, Shield, CloudRain, Siren, Trees, Map,
  CircleDot, Footprints, TriangleAlert, Construction, Hammer, Warehouse,
  LightbulbOff, Lightbulb, Cable, PanelTop, PowerOff,
  Trash2, Trash, ArchiveX, Bug, Droplets, Wind, Flame, Droplet, Waves, Cloud, Volume2,
  TrafficCone, Signpost, BadgeAlert, Route, Paintbrush, Ban,
  ToyBrick, ShieldX, LampFloor, AlertOctagon, Scissors, CircleAlert,
  CloudDrizzle, CloudLightning, Sun, FlameKindling, FireExtinguisher, Bomb, DoorOpen,
  GitBranch, CircleSlash, MapPinned, Baby, Lamp, Landmark, Sofa, HelpCircle,
} from 'lucide-react';

// Mapa por CÓDIGO de categoría
const categoriaIconMap: Record<string, React.ComponentType<{ size?: number; color?: string; className?: string }>> = {
  INFRAESTRUCTURA: Building2, ELECTRICO: Zap, SANITARIO: ShieldAlert, AMBIENTAL: Leaf,
  TRANSITO: Car, SEGURIDAD: Shield, CLIMATICO: CloudRain, EMERGENCIA: Siren,
  ARBOLADO: Trees, ESPACIOS_PUBLICOS: Map,
  INFRA_BACHE: CircleDot, INFRA_VEREDA_ROTA: Footprints, INFRA_HUNDIMIENTO: TriangleAlert,
  INFRA_ZANJA_ABIERTA: Construction, INFRA_OBRA_INSEGURA: Hammer, INFRA_MOBILIARIO_DANADO: Warehouse,
  ELEC_LUMINARIA_APAGADA: LightbulbOff, ELEC_LUMINARIA_INTERMITENTE: Lightbulb,
  ELEC_POSTE_INCLINADO: TriangleAlert, ELEC_CABLE_EXPUESTO: Cable,
  ELEC_TABLERO_INSEGURO: PanelTop, ELEC_CORTE_SECTORIAL: PowerOff,
  SAN_BASURAL: Trash2, SAN_CONTENEDOR_DESBORDADO: Trash, SAN_MICROBASURAL: ArchiveX,
  SAN_PLAGAS: Bug, SAN_AGUA_ESTANCADA: Droplets, SAN_OLOR_INTENSO: Wind,
  AMB_QUEMA_RESIDUOS: Flame, AMB_DERRAME: Droplet, AMB_CONTAMINACION_AGUA: Waves,
  AMB_CONTAMINACION_AIRE: Cloud, AMB_RUIDO_MOLESTO: Volume2,
  TRANS_SEMAFORO_FUERA_SERVICIO: TrafficCone, TRANS_SENAL_FALTANTE: Signpost,
  TRANS_SENAL_DANADA: BadgeAlert, TRANS_CRUCE_PELIGROSO: Route,
  TRANS_DEMARCACION_DESGASTADA: Paintbrush, TRANS_OBSTRUCCION_VIA: Ban,
  SEG_JUEGO_ROTO: ToyBrick, SEG_BARANDA_DANADA: ShieldX, SEG_ILUMINACION_INSEGURA: LampFloor,
  SEG_CABLE_BAJO: AlertOctagon, SEG_ELEMENTO_PUNZANTE: Scissors, SEG_TAPA_FALTANTE: CircleAlert,
  CLI_INUNDACION: Waves, CLI_ANEGAMIENTO: CloudDrizzle, CLI_VIENTO_FUERTE: Wind,
  CLI_TORMENTA_SEVERA: CloudLightning, CLI_OLA_CALOR: Sun,
  EMER_INCENDIO_BALDIO: FlameKindling, EMER_INCENDIO_ESTRUCTURA: FireExtinguisher,
  EMER_EXPLOSION: Bomb, EMER_EVACUACION: DoorOpen, EMER_DERRUMBE: TriangleAlert,
  ARB_ARBOL_RIESGO_CAIDA: Trees, ARB_RAMA_PELIGROSA: GitBranch, ARB_ARBOL_SECO: Trees,
  ARB_ARBOL_CABLEADO: Zap, ARB_TOCON_PELIGROSO: CircleSlash,
  ESP_PLAZA_ABANDONADA: MapPinned, ESP_JUEGO_INFANTIL_DANADO: Baby,
  ESP_FALTA_ILUMINACION: Lamp, ESP_FUENTE_DANADA: Landmark, ESP_BANCO_DANADO: Sofa,
};

export default categoriaIconMap;

type IconProps = { codigo?: string; size?: number; color?: string; className?: string };
type RiesgoIconProps = { icono?: string; size?: number; color?: string; className?: string };

// CategoriaIcon: busca por código en el mapa estático
export function CategoriaIcon({ codigo, size = 16, color, className }: IconProps) {
  const Icon = codigo ? categoriaIconMap[codigo] : null;
  if (!Icon) return <HelpCircle size={size} color={color ?? '#94a3b8'} className={className} />;
  return <Icon size={size} color={color ?? 'currentColor'} className={className} />;
}

// RiesgoIcon: usa el campo icono de la DB (kebab-case o PascalCase) como nombre del componente lucide
export function RiesgoIcon({ icono, size = 16, color, className }: RiesgoIconProps) {
  if (!icono) return <HelpCircle size={size} color={color ?? '#94a3b8'} className={className} />;
  // Convertir kebab-case a PascalCase: "flame-kindling" → "FlameKindling"
  const pascal = icono.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
  const Icon = (LucideIcons as any)[pascal];
  if (!Icon) return <HelpCircle size={size} color={color ?? '#94a3b8'} className={className} />;
  return <Icon size={size} color={color ?? 'currentColor'} className={className} />;
}
