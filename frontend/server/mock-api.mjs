import express from 'express'

const app = express()
const PORT = 5182

/** 与前端 src/data/model.ts 同构的只读 mock。真实实现由后端从 MySQL 取。 */
const meta = () => ({
  clock: new Date().toISOString(),
  weather: '多云 22 °C',
  engine: 'DAE · fsolve + ode15s',
  status: 'normal',
  queue: { running: 2, capacity: 8 },
})

const buses = [
  { id: 1, name: '主网', kv: 525, p: -412.6 },
  { id: 2, name: 'A 换流站', kv: 525, p: 186.4 },
  { id: 3, name: '水电 D 厂', kv: 525, p: 268.5 },
  { id: 4, name: 'C 光伏', kv: 525, p: 214.7 },
  { id: 5, name: 'D 换流站', kv: 230, p: 162.9 },
  { id: 6, name: '风电基地', kv: 220, p: 96.2 },
  { id: 7, name: '工业负荷', kv: 110, p: 61.8 },
  { id: 8, name: '储能站', kv: 35, p: -24.6 },
  { id: 9, name: '居民负荷', kv: 10, p: 22.4 },
]

const tasks = [
  { id: 'T20261023001', kind: '时域仿真', progress: 100, state: 'done' },
  { id: 'T20261023002', kind: '优化调度', progress: 68, state: 'running' },
  { id: 'T20261023003', kind: '可靠性评估', progress: 41, state: 'running' },
  { id: 'T20261023004', kind: '故障仿真', progress: 8, state: 'queued' },
]

app.get('/api/meta', (_req, res) => res.json(meta()))
app.get('/api/buses', (_req, res) => res.json({ items: buses }))
app.get('/api/tasks', (_req, res) => res.json({ items: tasks }))

app.post('/api/tasks', express.json(), (req, res) => {
  const id = 'T' + String(Date.now()).slice(-9)
  res.status(202).json({ taskId: id, status: 'queued', params: req.body ?? {} })
})

app.get('/api/traces/:taskId', (_req, res) => {
  const n = 240
  const t = []
  const u = []
  const f = []
  for (let i = 0; i <= n; i++) {
    const x = i / n
    t.push(+(x * 3).toFixed(3))
    u.push(+(525 + 1.4 * Math.sin(x * 7.4) + 0.5 * Math.sin(x * 21 + 1.1)).toFixed(3))
    f.push(+(50 + 0.055 * Math.sin(x * 5.1 + 0.4)).toFixed(4))
  }
  res.json({ taskId: _req.params.taskId, t, u, f })
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[mock-api] http://127.0.0.1:${PORT}/api/meta`)
})
