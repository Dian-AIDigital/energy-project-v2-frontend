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
  /** 后端真实电压等级（kV），无数据时为 0 */
  kv?: number
  /** 后端额定有功（MW），无数据时为空 */
  mw?: number | null
}

export interface TopoEdge {
  id: string
  from: string
  to: string
  kind: "bus" | "line"
  alert?: boolean
  /** polyline points in svg coords */
  points: [number, number][]
  /** 后端线路编号（图纸上支路旁的小号） */
  code?: string
  circuit?: number
  /** 交流 / 直流联络 / 变压器（后端 edge_type 未分类，由电压等级与站名推导） */
  lineType?: "ac" | "dc" | "transformer"
  km?: number
  r?: number
  l?: number
  c?: number
  iRated?: number
  /** 潮流方向，+1 表示 from → to */
  flow?: number
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