/**
 * Injectable event handlers.
 *
 * By default, all of these do nothing. User of this module have to implement
 * these functions to react to these mouse events, such as selection.
 */
type EventHandlers = {
  onNodeClick?: (selected: any, x: number, y: number) => void
  onEdgeClick?: (selected: any, x: number, y: number) => void
  onNodeMouseover?: (any) => void
  onEdgeMouseover?: (any) => void
  onBackgroundClick?: (layer:any, obj:any) => void
  onSelect?: (nodes: any[], edges: any[]) => void
}

export default EventHandlers
