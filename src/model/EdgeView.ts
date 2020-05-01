import ViewModel from "./ViewModel"

/**
 * View model for edges
 */
type EdgeView = ViewModel & {
    s: string,
    t: string,
    width?: number,
    color?: [number, number, number, number?]
}

export default EdgeView