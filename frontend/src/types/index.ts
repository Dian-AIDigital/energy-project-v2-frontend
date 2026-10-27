export type NodeStatus = "normal" | "overload" | "fault"

export interface TopoNode {
  id: string
  name: string
  sub: string
  kind: "wind" | "pv" | "substation" | "converter" | "grid" | "industry" | "residential" | "storage"
  status: NodeStatus
  x: number
  y: number
  textX?: number;
  textY?: number;
  textAnchor?: string;
  bus_id?: string; 
}

export interface TopoEdge {
  id: string
  from: string
  to: string
  kind: "bus" | "line"
  alert?: boolean
  /** polyline points in svg coords */
  points: [number, number][]
}

export interface Topology {
  id: string
  name: string
  nodes: TopoNode[]
  edges: TopoEdge[]
  buses: { id: string; name: string; x: number; y: number; w: number }[]
}

export interface NodeMeasurement {
  nodeId: string
  name: string
  voltageKv: number
  currentA: number
  powerMw: number
  status: NodeStatus
}

export interface SimTask {
  id: string
  type: string
  engine: string
  progress: number
  status: "running" | "queued" | "done"
  createdAt: string
}

export interface Scenario {
  id: string
  name: string
  tags: string[]
  riskLevel: number
  status: "ready" | "pending" | "done"
  imageHint: string
}

export interface SeriesPoint { time: string; values: [number, number, number, number] }

export interface WaveformData {
  times: string[]
  voltage: number[]
  frequency: number[]
  active: number[]
  reactive: number[]
}