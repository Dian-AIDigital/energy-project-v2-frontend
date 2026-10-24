import type { NodeMeasurement, Scenario, SimTask, Topology, WaveformData } from "../types"

export const topologies: Topology[] = [
  {
    id: "multi-source",
    name: "多源互联拓扑",
    nodes: [
      { id: "wf1", name: "风电场1", sub: "50MW", kind: "wind", status: "normal", x: 120, y: 90 },
      { id: "wf2", name: "风电场2", sub: "30MW", kind: "wind", status: "normal", x: 120, y: 250 },
      { id: "pv", name: "光伏电站", sub: "40MW", kind: "pv", status: "normal", x: 120, y: 410 },
      { id: "sub", name: "变电站", sub: "110/35kV", kind: "substation", status: "normal", x: 430, y: 80 },
      { id: "conv", name: "换流站", sub: "±200kV", kind: "converter", status: "overload", x: 430, y: 260 },
      { id: "grid", name: "主网", sub: "220kV", kind: "grid", status: "normal", x: 760, y: 80 },
      { id: "ind", name: "工业负荷", sub: "60MW", kind: "industry", status: "normal", x: 760, y: 190 },
      { id: "res", name: "居民负荷", sub: "20MW", kind: "residential", status: "normal", x: 760, y: 330 },
      { id: "ess", name: "储能电站", sub: "20MW/40MWh", kind: "storage", status: "normal", x: 430, y: 410 }
    ],
    edges: [
      { id: "e1", from: "wf1", to: "sub", kind: "line", points: [[170, 90], [330, 80]] },
      { id: "e2", from: "wf2", to: "conv", kind: "line", points: [[170, 250], [330, 260]] },
      { id: "e3", from: "pv", to: "ess", kind: "line", points: [[170, 410], [330, 410], [330, 410], [370, 410]] },
      { id: "e4", from: "sub", to: "conv", kind: "line", alert: true, points: [[430, 115], [430, 205]] },
      { id: "e5", from: "conv", to: "ind", kind: "line", alert: true, points: [[500, 260], [640, 190]] },
      { id: "e6", from: "conv", to: "res", kind: "line", alert: true, points: [[500, 290], [640, 330]] },
      { id: "e7", from: "grid", to: "sub", kind: "line", points: [[710, 80], [500, 80]] },
      { id: "e8", from: "ess", to: "conv", kind: "line", points: [[430, 375], [430, 315]] }
    ],
    buses: [
      { id: "b1", name: "35k母线", x: 300, y: 60, w: 10 },
      { id: "b2", name: "35kV母线", x: 300, y: 435, w: 220 },
      { id: "b3", name: "10kV母线", x: 660, y: 160, w: 190 },
      { id: "b4", name: "10kV母线", x: 660, y: 360, w: 190 }
    ]
  },
  { id: "pv-storage-charging", name: "光储充拓扑", nodes: [], edges: [], buses: [] },
  { id: "wind-pv-storage", name: "风光储拓扑", nodes: [], edges: [], buses: [] },
  { id: "microgrid", name: "微电网拓扑", nodes: [], edges: [], buses: [] },
  { id: "dc-distribution", name: "直流配电拓扑", nodes: [], edges: [], buses: [] }
]

for (const t of topologies.slice(1)) {
  t.nodes = topologies[0].nodes.map((n) => ({ ...n, status: "normal" }))
  t.edges = topologies[0].edges.map((e) => ({ ...e, alert: false }))
  t.buses = topologies[0].buses
}

export const measurements: NodeMeasurement[] = [
  { nodeId: "wf1", name: "风电场1", voltageKv: 35.02, currentA: 482, powerMw: 16.2, status: "normal" },
  { nodeId: "wf2", name: "风电场2", voltageKv: 34.87, currentA: 451, powerMw: 12.8, status: "normal" },
  { nodeId: "pv", name: "光伏电站", voltageKv: 35.16, currentA: 528, powerMw: 18.7, status: "normal" },
  { nodeId: "ess", name: "储能电站", voltageKv: 10.21, currentA: 312, powerMw: -8.4, status: "normal" },
  { nodeId: "conv", name: "换流站", voltageKv: 109.5, currentA: 956, powerMw: 0.0, status: "overload" },
  { nodeId: "ind", name: "工业负荷", voltageKv: 10.02, currentA: 803, powerMw: 58.6, status: "normal" },
  { nodeId: "res", name: "居民负荷", voltageKv: 9.98, currentA: 421, powerMw: 19.7, status: "normal" }
]

export const initialTasks: SimTask[] = [
  { id: "T20250517001", type: "时序仿真", engine: "暂态", progress: 100, status: "done", createdAt: "14:20:32" },
  { id: "T20250517002", type: "优化调度", engine: "稳态", progress: 70, status: "running", createdAt: "14:15:17" },
  { id: "T20250517003", type: "可靠性评估", engine: "评价", progress: 50, status: "running", createdAt: "14:10:03" },
  { id: "T20250517004", type: "故障仿真", engine: "暂态", progress: 10, status: "queued", createdAt: "14:05:46" },
  { id: "T20250517005", type: "场景仿真", engine: "稳态", progress: 100, status: "done", createdAt: "13:58:21" }
]

export const scenarios: Scenario[] = [
  { id: "s1", name: "典型日运行场景", tags: ["光储", "风电", "负荷"], riskLevel: 2, status: "ready", imageHint: "wind-pv-blue" },
  { id: "s2", name: "极端天气场景", tags: ["台风", "强风", "高负荷"], riskLevel: 4, status: "pending", imageHint: "storm-turbine" },
  { id: "s3", name: "故障恢复场景", tags: ["线路故障", "设备故障"], riskLevel: 3, status: "pending", imageHint: "sunset-tower" },
  { id: "s4", name: "高比例新能源场景", tags: ["光伏", "风电", "低负荷"], riskLevel: 3, status: "ready", imageHint: "solar-farm" },
  { id: "s5", name: "冬季低温场景", tags: ["低温", "负荷高", "储能"], riskLevel: 3, status: "pending", imageHint: "snow-wind" },
  { id: "s6", name: "多源协同场景", tags: ["光储", "风电", "负荷"], riskLevel: 3, status: "done", imageHint: "control-room" }
]

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function buildWaveform(): WaveformData {
  const times: string[] = []
  const voltage: number[] = []
  const frequency: number[] = []
  const active: number[] = []
  const reactive: number[] = []
  const rnd = seeded(42)
  for (let h = 0; h <= 24; h += 1) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 24 && m > 0) continue
      const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      times.push(t)
      const dayCurve = Math.sin(((h * 60 + m) / 1440) * Math.PI * 2 - Math.PI / 2)
      voltage.push(200 + 90 * Math.sin((h / 24) * Math.PI * 2) + (rnd() - 0.5) * 30)
      frequency.push(49.9 + 0.25 * dayCurve + (rnd() - 0.5) * 0.15)
      active.push(160 + 60 * dayCurve + (rnd() - 0.5) * 25)
      reactive.push(30 + 18 * Math.sin((h / 24) * Math.PI * 4) + (rnd() - 0.5) * 10)
    }
  }
  return { times, voltage, frequency, active, reactive }
}