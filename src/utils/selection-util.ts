type Area = {
  x: number
  y: number
  width: number
  height: number
}

export const getArea = (startX: number, startY: number, endX: number, endY: number): Area => {
  const positions: [number, number, number, number] = getPoints(startX, startY, endX, endY)
  const xLeftTop = positions[0]
  const yLeftTop = positions[1]
  const xRightBottom = positions[2]
  const yRightBottom = positions[3]

  const width: number = Math.abs(xRightBottom - xLeftTop)
  const height: number = Math.abs(yRightBottom - yLeftTop)

  const area: Area = {x: xLeftTop, y: yLeftTop, width, height}

  return area
}

const getPoints = (
  startX: number,
  startY: number,
  endX: number,
  endY: number
): [number, number, number, number] => {
  if (startX < endX && startY < endY) {
    console.log('!!!base select:', startX, startY, endX, endY)
    return [startX, startY, endX, endY]
  } else if (startX < endX && startY > endY) {
    console.log('!!!base select case2:', startX, startY, endX, endY)
    return [startX, endY, endX, startY]
  } else if (startX > endX && startY > endY) {
    console.log('!!!base select case3:', startX, startY, endX, endY)
    return [endX, endY, startX, startY]
  } else {
    console.log('!!!base select case4:', startX, startY, endX, endY)
    return [endX, startY, startX, endY]
  }
}
