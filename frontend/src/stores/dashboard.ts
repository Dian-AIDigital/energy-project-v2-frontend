import { defineStore } from "pinia"
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
    condition: "典型日场景"
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