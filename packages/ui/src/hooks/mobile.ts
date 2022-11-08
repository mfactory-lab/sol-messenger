export function useMobileDetect() {
  const userAgent = ref(getUserAgent())
  return {
    userAgent,
    isMobileOs: computed(() => isMobileOs(userAgent.value)),
    isWebView: computed(() => isWebView(userAgent.value)),
  }
}

let _userAgent: string
function getUserAgent() {
  if (_userAgent === undefined) {
    _userAgent = globalThis.navigator?.userAgent ?? null
  }
  return _userAgent
}

function isMobileOs(userAgent: string) {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
}

function isWebView(userAgent: string) {
  return /(WebView|(Phantom|Solflare)|Version\/.+(Chrome)\/(\d+)\.(\d+)\.(\d+)\.(\d+)|; wv\).+(Chrome)\/(\d+)\.(\d+)\.(\d+)\.(\d+))/i.test(
    userAgent,
  )
}
