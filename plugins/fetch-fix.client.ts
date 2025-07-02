export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    // 修正 fetch 被非法呼叫的問題
    window.fetch = window.fetch.bind(window)
  }
})
