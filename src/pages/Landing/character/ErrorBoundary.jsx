import { Component } from 'react'

/**
 * 자식 렌더 중 에러(예: GLB 로드 실패/디코드 불가)를 잡아 fallback 으로 대체.
 * GLB 가 없거나 깨졌을 때 동일 캐릭터의 SVG 스프라이트로 폴백하는 데 쓴다.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.warn('GLB 로드 실패 → 스프라이트로 대체:', error?.message || error)
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}
