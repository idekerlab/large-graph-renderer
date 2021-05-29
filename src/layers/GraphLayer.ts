import {CompositeLayer, LayerProps} from '@deck.gl/core'
import {createNodeLayer} from './NodeLayer'
import {createEdgeLayers} from './EdgeLayer'
import {createLabelLayer} from './LabelLayer'
import GraphLayerProps from './GraphLayerProps'
import {createSelectionLayer} from './SelectionLayer'

class GraphLayer extends CompositeLayer<GraphLayerProps> {
  multiple: boolean

  constructor(props: GraphLayerProps) {
    super(props)
  }

  onClick(info) {
    return info
  }

  getPickingInfo(pickingInfo) {
    // const currentProps = this['props']
    const {mode, info} = pickingInfo

    // // @ts-ignore
    // const {onNodeClick, onEdgeClick} = currentProps.eventHandlers

    // if (mode === 'query' && currentProps.multipleSelection === false) {
    //   console.log('PICK info called::', pickingInfo)
    //   const isNode = info.object.position ? true : false

    //   if (isNode) {
    //     onNodeClick(info.object, info.x, info.y)
    //     info.object.selected = true
    //   } else {
    //     onEdgeClick(info.object, info.x, info.y)
    //     info.object.selected = true
    //   }
    // } else {
    //   // @ts-ignore
    //   this.props.eventHandlers.onNodeMouseover(info)
    // }
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
      edgePickable,
      bounds
    } = this['props']
    const nodeLayer = createNodeLayer(nodeViews, nodePickable)
    const nodeLabelLayer = createLabelLayer(nodeViews, showLabels)

    const selectionLayer = createSelectionLayer(bounds)

    if (showEdges) {
      const edgeLayers = createEdgeLayers(
        edgeViews,
        nodeViewMap,
        render3d,
        showEdges,
        edgePickable,
        edgeLayerDepth
      )
      return [...edgeLayers, nodeLayer, nodeLabelLayer]
    }

    return [nodeLayer, nodeLabelLayer, selectionLayer]
  }
}

export default GraphLayer
