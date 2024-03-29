import EventHandlers from '../../layers/EventHandlers'

export const DEF_EVENT_HANDLER: EventHandlers = {
  onNodeClick: (event, x, y): void => {
    console.log('* Default click handler: node', event, x, y)
  },
  onEdgeClick: (event, x, y): void => {
    console.log('* Default click handler: edge', event, x, y)
  },
  onNodeMouseover: (event): void => {
    // console.log('* Mouse over: node', event)
  },
  onEdgeMouseover: (event): void => {
    // console.log('* Mouse over: edge', event)
  },
  onBackgroundClick: (layer: any, object: any): void => {
    console.log('* BG click event')
  },
  onSelect: (nodes: any[], edges: any[]): void => {
    console.log('* Selected', nodes, edges)
  }
}

