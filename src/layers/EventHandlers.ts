/**
 * Injectable event handlers.
 *
 * By default, all of these do nothing. User of this module have to implement
 * these functions to react to these mouse events, such as selection.
 */
type EventHandlers = {
  onNodeClick?: Function
  onEdgeClick?: Function
  onNodeMouseover?: Function
  onEdgeMouseover?: Function
  onBackgroundClick?: Function
}

export default EventHandlers
