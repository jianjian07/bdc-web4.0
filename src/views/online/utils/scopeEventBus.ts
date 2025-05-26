import mitt from 'mitt'

// 局部总线
export function createScopedBus() {
  return mitt()
}