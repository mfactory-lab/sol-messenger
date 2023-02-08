export * from './crypto'

function u16ToLEBytes(num: number) {
  return [num & 0xFF, (num >> 8) & 0xFF]
}
