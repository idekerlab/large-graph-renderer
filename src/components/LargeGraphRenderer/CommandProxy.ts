type FitFunction = {}

/**
 * Proxy object to accept commands for LGR
 */
class CommandProxy {
  _fitFunction: () => void
  _zoomFunction: (level: number) => void

  constructor(fitFunction: () => void, zoomFunction: (level: number) => void) {
    this._fitFunction = fitFunction
    this._zoomFunction = zoomFunction
  }

  fit = (): void => {
    this._fitFunction()
  }

  zoomIn = (): void => {
    this._zoomFunction(0.1)
  }

  zoomOut = (): void => {
    this._zoomFunction(-0.1)
  }
}

export default CommandProxy
