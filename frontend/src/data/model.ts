export interface Bus {
  id: number
  name: string
  kv: number
  kind: 'grid' | 'bus' | 'converter' | 'plant' | 'load' | 'storage'
  x: number
  y: number
  /** 选中时的读数 */
  read: { v: number; i: number; p: number; q: number; state: 'normal' | 'warn' | 'off' }
  units?: { name: string; mw: number }[]
}

export interface Line {
  id: string
  from: number
  to: number
  type: 'ac' | 'dc' | 'transformer'
  km: number
  r: number
  x: number
  c: number
  flow: number
  mw: number
}

export const buses: Bus[] = [
  { id: 1, name: '主网', kv: 525, kind: 'grid', x: 90, y: 300, read: { v: 525.4, i: 1180, p: -412.6, q: 36.2, state: 'normal' } },
  { id: 2, name: 'A 换流站', kv: 525, kind: 'converter', x: 252, y: 300, read: { v: 524.1, i: 962, p: 186.4, q: -12.8, state: 'normal' } },
  { id: 3, name: '水电 D 厂', kv: 525, kind: 'plant', x: 440, y: 300, read: { v: 525.8, i: 741, p: 268.5, q: 44.1, state: 'normal' },
    units: [{ name: 'D1', mw: 128 }, { name: 'D2', mw: 140 }] },
  { id: 4, name: 'C 光伏', kv: 525, kind: 'plant', x: 630, y: 300, read: { v: 526.2, i: 615, p: 214.7, q: -58.3, state: 'normal' },
    units: [{ name: 'C1', mw: 108 }, { name: 'C2', mw: 106 }] },
  { id: 5, name: 'D 换流站', kv: 230, kind: 'converter', x: 812, y: 300, read: { v: 229.6, i: 488, p: 162.9, q: 8.4, state: 'warn' } },
  { id: 6, name: '风电基地', kv: 220, kind: 'plant', x: 300, y: 150, read: { v: 221.3, i: 356, p: 96.2, q: -21.5, state: 'normal' },
    units: [{ name: 'R1', mw: 48 }, { name: 'R2', mw: 48.2 }] },
  { id: 7, name: '工业负荷', kv: 110, kind: 'load', x: 812, y: 428, read: { v: 109.2, i: 402, p: 61.8, q: 12.6, state: 'normal' } },
  { id: 8, name: '储能站', kv: 35, kind: 'storage', x: 630, y: 428, read: { v: 34.8, i: 168, p: -24.6, q: 2.1, state: 'normal' } },
  { id: 9, name: '居民负荷', kv: 10, kind: 'load', x: 440, y: 428, read: { v: 10.1, i: 212, p: 22.4, q: 4.8, state: 'normal' } },
]

export const lines: Line[] = [
  { id: 'L12', from: 1, to: 2, type: 'ac', km: 88, r: 0.0199, x: 0.0009, c: 1.45e-6, flow: 1, mw: 186.4 },
  { id: 'L23', from: 2, to: 3, type: 'ac', km: 247, r: 0.0186, x: 0.0007, c: 4.89e-6, flow: 1, mw: 82.1 },
  { id: 'L34', from: 3, to: 4, type: 'ac', km: 25, r: 0.9046, x: 0.0009, c: 3.18e-7, flow: -1, mw: 38.4 },
  { id: 'L45', from: 4, to: 5, type: 'transformer', km: 0, r: 0.0776, x: 0.0154, c: 2.14e-7, flow: 1, mw: 162.9 },
  { id: 'L26', from: 2, to: 6, type: 'dc', km: 640, r: 0.0221, x: 0.0011, c: 0, flow: -1, mw: 96.2 },
  { id: 'L57', from: 5, to: 7, type: 'transformer', km: 0, r: 0.8103, x: 0.0132, c: 6.2e-8, flow: 1, mw: 61.8 },
  { id: 'L48', from: 4, to: 8, type: 'transformer', km: 0, r: 0.6214, x: 0.0089, c: 4.4e-8, flow: 1, mw: 24.6 },
  { id: 'L39', from: 3, to: 9, type: 'transformer', km: 0, r: 0.9932, x: 0.0098, c: 3.1e-8, flow: 1, mw: 22.4 },
  { id: 'L98', from: 9, to: 8, type: 'ac', km: 12, r: 0.2140, x: 0.0004, c: 9.0e-8, flow: 1, mw: 4.6 },
]

export interface Scenario {
  id: string
  name: string
  short: string
  risk: 1 | 2 | 3 | 4
  state: 'ready' | 'pending' | 'done'
}

export const scenarios: Scenario[] = [
  { id: 'typical', name: '典型日运行', short: '典型日', risk: 1, state: 'ready' },
  { id: 'extreme', name: '极端天气', short: '极端天气', risk: 3, state: 'pending' },
  { id: 'fault', name: '故障恢复', short: '故障恢复', risk: 3, state: 'pending' },
  { id: 'highre', name: '高比例新能源', short: '高比例', risk: 2, state: 'ready' },
  { id: 'winter', name: '冬季低温', short: '冬季低温', risk: 3, state: 'pending' },
  { id: 'multi', name: '多源协同', short: '多源协同', risk: 1, state: 'done' },
]

export interface TaskRow {
  id: string
  kind: string
  engine: string
  progress: number
  state: 'done' | 'running' | 'queued'
  time: string
}

export const tasks: TaskRow[] = [
  { id: 'T20261023001', kind: '时域仿真', engine: '暂态', progress: 100, state: 'done', time: '14:20:32' },
  { id: 'T20261023002', kind: '优化调度', engine: '模态', progress: 68, state: 'running', time: '14:15:17' },
  { id: 'T20261023003', kind: '可靠性评估', engine: '评价', progress: 41, state: 'running', time: '14:10:03' },
  { id: 'T20261023004', kind: '故障仿真', engine: '暂态', progress: 8, state: 'queued', time: '14:05:46' },
  { id: 'T20261023005', kind: '场景仿真', engine: '暂态', progress: 100, state: 'done', time: '13:58:21' },
]

/** 波形：确定性合成，四条曲线共用一条时间轴 */
export function buildTraces(points = 240) {
  const t: number[] = []
  const v: number[] = []
  const f: number[] = []
  const p: number[] = []
  const q: number[] = []
  for (let i = 0; i <= points; i++) {
    const x = i / points
    t.push(x * 3)
    v.push(525 + 1.4 * Math.sin(x * 7.4) + 0.5 * Math.sin(x * 21 + 1.1))
    f.push(50 + 0.055 * Math.sin(x * 5.1 + 0.4) + 0.018 * Math.sin(x * 17))
    p.push(186 + 12 * Math.sin(x * 4.2 + 0.9) + 4 * Math.sin(x * 13 + 0.2))
    q.push(36 + 6 * Math.sin(x * 3.1 + 1.7) + 2.4 * Math.sin(x * 11))
  }
  return { t, v, f, p, q }
}
