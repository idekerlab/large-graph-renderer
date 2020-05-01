import ViewModel from "./ViewModel"

/**
 * View model type for the nodes.
 *  
 */
type NodeView = ViewModel & {
    label?: string,
    position: [number, number, number?],
    color?: [number, number, number, number?],
    size?: number
}

export default NodeView