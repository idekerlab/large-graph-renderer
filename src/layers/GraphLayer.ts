import {CompositeLayer, LayerProps} from '@deck.gl/core'
import {createNodeLayer} from './NodeLayer'
import {createEdgeLayers} from './EdgeLayer'
import {createLabelLayer} from './LabelLayer'
import GraphLayerProps from './GraphLayerProps'
import {createSelectionLayer} from './SelectionLayer'

// const getLayers = (edgeViews: EdgeView[]): EdgeView[] => {
//   const edgeCount = edgeViews.length
//   const evs = [...edgeViews.values()]

//   let idx = 0

//   const layer1: EdgeView[] = []
//   const layer2: EdgeView[] = []

//   while (idx < edgeCount) {
//     const ev = evs[idx]
//     if (idx % 2 === 0) {
//       layer1.push(ev)
//     } else {
//       layer2.push(ev)
//     }
//     idx++
//   }
//   return [layer1, layer2]
// }

class GraphLayer extends CompositeLayer<GraphLayerProps> {
  constructor(props: GraphLayerProps) {
    super(props)
  }

  onClick(info) {
    return info
  }

  getPickingInfo(pickingInfo) {
    const currentProps = this['props']
    const {mode, info} = pickingInfo

    // @ts-ignore
    const {onNodeClick, onEdgeClick} = currentProps.eventHandlers

    if (mode === 'query') {
      const isNode = info.object.position ? true : false

      if (isNode) {
        onNodeClick(info.object, info.x, info.y)
        info.object.selected = true
      } else {
        onEdgeClick(info.object, info.x, info.y)
        info.object.selected = true
      }
    } else {
      // @ts-ignore
      this.props.eventHandlers.onNodeMouseover(info)
    }
    return info
  }

  renderLayers(): any[] {
    // @ts-ignore
    const {
      nodeViews,
      nodeViewMap,
      edgeViews,
      showEdges,
      showLabels,
      edgeLayerDepth,
      render3d,
      nodePickable,
      edgePickable
    } = this['props']
    const nodeLayer = createNodeLayer(nodeViews, nodePickable)
    const nodeLabelLayer = createLabelLayer(nodeViews, showLabels)

    const selectionLayer = createSelectionLayer()

    if (showEdges) {
      const edgeLayers = createEdgeLayers(
        edgeViews,
        nodeViewMap,
        render3d,
        showEdges,
        edgePickable,
        edgeLayerDepth
      )
      return [...edgeLayers, nodeLayer, nodeLabelLayer, selectionLayer]
    }

    return [nodeLayer, nodeLabelLayer]
  }
}

export default GraphLayer
