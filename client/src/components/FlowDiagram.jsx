import { ReactFlow, Background } from '@xyflow/react'

const NODE_WIDTH = 220
const VERTICAL_GAP = 90


const buildFlowData = (steps) => {
  const nodes = steps.map((step, idx) => ({
    id: String(step.step),
    position: { x: 0, y: idx * VERTICAL_GAP },
    data: {
      label: (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{step.label}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{step.description}</div>
          <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: 'var(--signal)' }}>
            {step.file?.split('/').pop()}
          </div>
        </div>
      )
    },
    style: {
      width: NODE_WIDTH,
      background: 'var(--bg-raised)',
      border: '1px solid var(--line)',
      borderRadius: 6,
      color: 'var(--text-primary)',
      padding: 10,
      textAlign: 'left'
    }
  }))

  const edges = steps.slice(1).map((step, idx) => ({
    id: `e${idx}`,
    source: String(steps[idx].step),
    target: String(step.step),
    style: { stroke: 'var(--signal)' },
    animated: true
  }))

  return { nodes, edges }
}

const FlowDiagram = ({ title, steps }) => {
  if (!steps || steps.length === 0) {
    return (
      <p className="text-sm py-4" style={{ color: 'var(--text-muted)' }}>
        Couldn't generate a flow for that query.
      </p>
    )
  }

  const { nodes, edges } = buildFlowData(steps)
  const height = steps.length * VERTICAL_GAP + 60

  return (
    <div className="py-3">
      <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </p>
      <div
        style={{ height, border: '1px solid var(--line)', borderRadius: 6 }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodesDraggable={false}
          nodesConnectable={false}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background color="var(--line)" gap={16} />
        </ReactFlow>
      </div>
    </div>
  )
}

export default FlowDiagram