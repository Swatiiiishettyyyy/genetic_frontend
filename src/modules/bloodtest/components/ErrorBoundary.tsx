import React from 'react'
import { logEvent } from '../utils/logger'

interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    logEvent('ERROR', window.location.pathname, { message: error.message, stack: error.stack })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button onClick={() => window.location.href = '/'} className="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-dark">
              Go Home
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
