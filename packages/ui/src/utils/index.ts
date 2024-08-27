export * from './web3'
export * from './format'

export function getBadgeColor(text: string) {
  if (!text) {
    return { background: '#000' }
  }
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 255
    color += (`00${value.toString(16)}`).substr(-2)
  }
  return { background: color }
}
