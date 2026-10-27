import { defineStore } from "pinia"
import axios from "axios" 
import { buildWaveform, initialTasks, measurements, scenarios, topologies } from "../mock/data"
import type { NodeMeasurement, Topology } from "../types"

export const useDashboardStore = defineStore("dashboard", {
  state: () => ({

    topologies,
    currentTopologyId: topologies[0].id,
    measurements,
    tasks: [...initialTasks],
    scenarios,
    waveform: buildWaveform(),
    selectedNodeId: "conv",
    params: {
      pvOutput: 60,
      windOutput: 45,
      load: 70,
      soc: 50
    },
    fault: {
      enabled: true,
      type: "线路故障",
      location: "10kV母线1"
    },
    condition: "典型日场景",
    isLoading: false 
  }),
  getters: {
    currentTopology(state): Topology {
      return state.topologies.find((t) => t.id === state.currentTopologyId) ?? state.topologies[0]
    },
    selectedNode(state): NodeMeasurement | undefined {
      return state.measurements.find((m) => m.nodeId === state.selectedNodeId)
    }
  },

  actions: {

    async fetchRealData() {
      this.isLoading = true
      try {
        const listRes = await axios.get('/api/v1/topologies')
        const topoList = listRes.data || []
        
        const allTopologies: any[] = []

        for (const item of topoList) {
          const code = item.topology_code
          const detailRes = await axios.get(`/api/v1/topologies/${code}`)
          const raw = detailRes.data
          const nodes = raw.nodes || []
          const edges = raw.edges || []

          if (nodes.length === 0) continue

          const xs = nodes.map((n: any) => Number(n.x) || 0)
          const ys = nodes.map((n: any) => Number(n.y) || 0)
          const minX = Math.min(...xs)
          const maxX = Math.max(...xs)
          const minY = Math.min(...ys)
          const maxY = Math.max(...ys)

          const width = maxX - minX || 1
          const height = maxY - minY || 1
          
          const padding = 60
          const canvasW = 920 - padding * 2
          const canvasH = 480 - padding * 2

          const scaleX = canvasW / width
          const scaleY = canvasH / height
          const scale = Math.min(scaleX, scaleY)

          const offsetX = (canvasW - width * scale) / 2 + padding
          const offsetY = (canvasH - height * scale) / 2 + padding

          let translatedNodes = nodes.map((n: any) => {
            const nx = (Number(n.x) - minX) * scale + offsetX
            const ny = (Number(n.y) - minY) * scale + offsetY
            
            return {
              id: n.node_code,
              bus_id: n.bus_id,
              name: n.label || n.node_code,
              sub: n.node_type,
              kind: n.node_type,
              status: 'normal',
              x: nx,
              y: ny
            }
          })

          let minYDist = Infinity
          for (let i = 0; i < translatedNodes.length; i++) {
            for (let j = i + 1; j < translatedNodes.length; j++) {
              const n1 = translatedNodes[i]
              const n2 = translatedNodes[j]
              if (Math.abs(n1.x - n2.x) < 20) {
                const dy = Math.abs(n1.y - n2.y)
                if (dy < minYDist) {
                  minYDist = dy
                }
              }
            }
          }

          const SAFE_Y = 60
          if (minYDist < SAFE_Y && minYDist > 0) {
            let expand = Math.min(SAFE_Y / minYDist, 4)
            if (expand > 1.1) {
              translatedNodes.forEach((n: any) => {
                n.x = n.x * expand
                n.y = n.y * expand
              })

              const nxs = translatedNodes.map((n: any) => n.x)
              const nys = translatedNodes.map((n: any) => n.y)
              const nMinX = Math.min(...nxs)
              const nMaxX = Math.max(...nxs)
              const nMinY = Math.min(...nys)
              const nMaxY = Math.max(...nys)
              
              const nWidth = nMaxX - nMinX
              const nHeight = nMaxY - nMinY
              
              const nOffsetX = (920 - nWidth) / 2 - nMinX
              const nOffsetY = (480 - nHeight) / 2 - nMinY
              
              translatedNodes.forEach((n: any) => {
                n.x += nOffsetX
                n.y += nOffsetY
              })
            }
          }

          const translatedEdges = edges
            .map((e: any) => {
              const fromNode = translatedNodes.find((n: any) => n.bus_id === e.from_bus_id)
              const toNode = translatedNodes.find((n: any) => n.bus_id === e.to_bus_id)

              if (!fromNode || !toNode) return null

              return {
                id: `${e.edge_code}-${e.circuit_no || 1}-${e.from_bus_id}-${e.to_bus_id}`,
                from: e.from_bus_id,
                to: e.to_bus_id,
                kind: 'line',
                alert: false,
                points: [[fromNode.x, fromNode.y], [toNode.x, toNode.y]] as number[][]
              }
            })
            .filter((e: any) => e !== null)

          allTopologies.push({
            id: raw.topology_code,
            name: raw.name,
            nodes: translatedNodes,
            edges: translatedEdges,
            buses: [] 
          })
        }

        if (allTopologies.length > 0) {
          this.topologies = allTopologies
          this.currentTopologyId = allTopologies[0].id

          const rawNodes = topoList.find((t: any) => t.topology_code === this.currentTopologyId)?.nodes || []
          const firstTopoDetail = await axios.get(`/api/v1/topologies/${this.currentTopologyId}`)
          const detailNodes = firstTopoDetail.data.nodes || []
          
          const realMeasurements: any[] = []
          allTopologies[0].nodes.forEach((n: any) => {
            const rawNode = detailNodes.find((rn: any) => rn.node_code === n.id)
            if (rawNode) {
              realMeasurements.push({
                nodeId: n.id,
                name: n.name,
                voltageKv: Number(rawNode.voltage_kv) || 0,
                currentA: Math.floor(Math.random() * 500) + 100,
                powerMw: Number(rawNode.rated_power_mw) || 0,
                status: 'normal'
              })
            }
          })
          
          if (realMeasurements.length > 0) {
            this.measurements = realMeasurements
          }
        }
        console.log("data updated")
      } catch (error) {
        console.error("api failed", error)
      } finally {
        this.isLoading = false
      }
    },
    setTopology(id: string) {
      this.currentTopologyId = id
    },
    selectNode(id: string) {
      this.selectedNodeId = id
    },
    applyScenario(scenarioId: string) {
      const s = this.scenarios.find((x) => x.id === scenarioId)
      if (!s) return
      const condMap: Record<string, string> = { s1: "典型日场景", s2: "极端天气", s3: "故障恢复", s4: "高比例新能源", s5: "冬季低温", s6: "多源协同" }
      this.condition = condMap[scenarioId] ?? "典型日场景"
      if (scenarioId === "s1") {
        this.params = { pvOutput: 60, windOutput: 45, load: 70, soc: 50 }
      } else if (scenarioId === "s2") {
        this.params = { pvOutput: 20, windOutput: 80, load: 90, soc: 40 }
      } else if (scenarioId === "s3") {
        this.fault = { ...this.fault, enabled: true, type: "线路故障", location: "10kV母线1" }
      } else if (scenarioId === "s4") {
        this.params = { pvOutput: 90, windOutput: 70, load: 30, soc: 65 }
      } else if (scenarioId === "s5") {
        this.params = { pvOutput: 30, windOutput: 40, load: 85, soc: 35 }
      } else {
        this.params = { pvOutput: 55, windOutput: 50, load: 60, soc: 55 }
      }
    },
    submitTask() {
      const now = new Date()
      const id = `T${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(this.tasks.length + 1).padStart(3, "0")}`
      this.tasks.unshift({
        id,
        type: "场景仿真",
        engine: "暂态",
        progress: 5,
        status: "queued",
        createdAt: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      })
    },
    tickTasks() {
      for (const t of this.tasks) {
        if (t.status === "running" && t.progress < 100) {
          t.progress = Math.min(100, t.progress + Math.ceil(Math.random() * 4))
          if (t.progress >= 100) t.status = "done"
        } else if (t.status === "queued" && Math.random() < 0.25) {
          t.status = "running"
        }
      }
    }
  }
})