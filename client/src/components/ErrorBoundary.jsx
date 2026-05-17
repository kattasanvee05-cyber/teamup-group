import { Component } from 'react'
import { FiWifi, FiMail } from 'react-icons/fi'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center" style={{ background: '#050b15' }}>
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/[0.04]">
          <FiWifi size={36} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Website is down</h1>
          <p className="mt-2 text-sm text-white">
            Something went wrong on our end. We're working on it.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-[#4fd1ff]/15 px-5 py-2.5 text-sm font-semibold text-[#4fd1ff] transition-colors hover:bg-[#4fd1ff]/25"
        >
          Try again
        </button>
        <a
          href="mailto:noreply.teamup.com@gmail.com"
          className="flex items-center gap-2 text-xs text-white transition-colors hover:text-white"
        >
          <FiMail size={12} />
          noreply.teamup.com@gmail.com
        </a>
      </div>
    )
  }
}
