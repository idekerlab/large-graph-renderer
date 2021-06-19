import {CompositeLayer, LayerProps} from '@deck.gl/core'
import {createNodeLayer} from './NodeLayer'
import {createEdgeLayers} from './EdgeLayer'
import {createLabelLayer} from './LabelLayer'
import GraphLayerProps from './GraphLayerProps'
import {createSelectionLayer} from './SelectionLayer'

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

    if (currentProps.disableClick) {
      return info
    }

    if (mode === 'query' && currentProps.multipleSelection === false) {
      // @ts-ignore
      const {onNodeClick, onEdgeClick} = currentProps.eventHandlers
      const isNode = info.object.position ? true : false

      if (isNode) {
        onNodeClick(info.object, info.x, info.y)
        info.object.selected = true
      } else {
        onEdgeClick(info.object, info.x, info.y)
        info.object.selected = true
      }
    } else {
      // // @ts-ignore
      // this.props.eventHandlers.onNodeMouseover(info)
    }
    return info
  }

  renderLayers(): any[] {
    const {
      nodeViews,
      nodeViewMap,
      edgeViews,
      showEdges,
      showLabels,
      edgeLayerDepth,
      render3d,
      nodePickable,
      edgePickable,
      bounds,
      selectedNodes,
      selectedEdges,
      updated
    } = this['props']

    // Nodes
    const nodeLayer = createNodeLayer(nodeViews, nodePickable, selectedNodes)

    // Node labels
    const nodeLabelLayer = createLabelLayer(nodeViews, showLabels)

    // Selection box
    const selectionLayer = createSelectionLayer(bounds)

    // Edges in multiple layers
    const edgeLayers = createEdgeLayers(
      edgeViews,
      nodeViewMap,
      render3d,
      showEdges,
      edgePickable,
      edgeLayerDepth,
      selectedEdges,
      updated
    )
    return [...edgeLayers, nodeLayer, nodeLabelLayer, selectionLayer]
    // return [nodeLayer, nodeLabelLayer, selectionLayer]
  }
}

export default GraphLayer
