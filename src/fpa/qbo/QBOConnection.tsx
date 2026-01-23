/**
 * @file QBOConnection.tsx
 * @description QuickBooks Online OAuth2 connection component
 * @related-issue #24 - QuickBooks Online API connection
 */

/* global window, crypto, sessionStorage, setTimeout, URLSearchParams */

import { useState, useCallback } from 'react'
import { useQBOStore } from './store'
import type { QBOConnectionStatus } from './types'

// OAuth2 config - would come from env in production
const QBO_OAUTH_CONFIG = {
  clientId: import.meta.env.VITE_QBO_CLIENT_ID || 'your-client-id',
  redirectUri: import.meta.env.VITE_QBO_REDIRECT_URI || `${window.location.origin}/qbo/callback`,
  scope: 'com.intuit.quickbooks.accounting openid profile email',
  authUrl: 'https://appcenter.intuit.com/connect/oauth2',
}

type ConnectionState = 'idle' | 'connecting' | 'error'

/* eslint-disable no-unused-vars */
interface QBOConnectionProps {
  onConnected?: (status: QBOConnectionStatus) => void
  onDisconnected?: () => void
}
/* eslint-enable no-unused-vars */

export function QBOConnection({ onConnected, onDisconnected }: QBOConnectionProps) {
  const { connectionStatus, setConnectionStatus } = useQBOStore()
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const generateStateToken = () => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
  }

  const initiateOAuth = useCallback(() => {
    setConnectionState('connecting')
    setErrorMessage(null)

    const stateToken = generateStateToken()
    sessionStorage.setItem('qbo_oauth_state', stateToken)

    const params = new URLSearchParams({
      client_id: QBO_OAUTH_CONFIG.clientId,
      redirect_uri: QBO_OAUTH_CONFIG.redirectUri,
      scope: QBO_OAUTH_CONFIG.scope,
      response_type: 'code',
      state: stateToken,
    })

    const authUrl = `${QBO_OAUTH_CONFIG.authUrl}?${params.toString()}`

    // In production, redirect to QBO. For demo, simulate success.
    if (QBO_OAUTH_CONFIG.clientId === 'your-client-id') {
      // Demo mode - simulate successful connection
      setTimeout(() => {
        const mockStatus: QBOConnectionStatus = {
          connected: true,
          companyName: 'SportsProd LLC',
          lastSync: null,
          tokenExpiry: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        }
        setConnectionStatus(mockStatus)
        setConnectionState('idle')
        onConnected?.(mockStatus)
      }, 1500)
    } else {
      // Production - redirect to QBO OAuth
      window.location.href = authUrl
    }
  }, [setConnectionStatus, onConnected])

  const disconnect = useCallback(() => {
    const confirmed = window.confirm(
      'Disconnect from QuickBooks Online? You can reconnect anytime.'
    )
    if (!confirmed) return

    setConnectionStatus({
      connected: false,
      companyName: null,
      lastSync: null,
      tokenExpiry: null,
    })
    sessionStorage.removeItem('qbo_oauth_state')
    onDisconnected?.()
  }, [setConnectionStatus, onDisconnected])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleString()
  }

  const isTokenExpiringSoon = () => {
    if (!connectionStatus.tokenExpiry) return false
    const expiry = new Date(connectionStatus.tokenExpiry)
    const now = new Date()
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursUntilExpiry < 24
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        {/* Logo and Status */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              QuickBooks Online
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusIndicator status={connectionStatus.connected ? 'connected' : 'disconnected'} />
              <span
                className={`text-sm ${
                  connectionStatus.connected ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {connectionStatus.connected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {!connectionStatus.connected ? (
            <button
              onClick={initiateOAuth}
              disabled={connectionState === 'connecting'}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                connectionState === 'connecting'
                  ? 'bg-gray-100 text-gray-400 cursor-wait'
                  : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
              }`}
            >
              {connectionState === 'connecting' ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Connecting...
                </span>
              ) : (
                'Connect to QuickBooks'
              )}
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Connection Details */}
      {connectionStatus.connected && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Company</p>
              <p className="font-medium text-gray-900 mt-0.5">
                {connectionStatus.companyName}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Last Sync</p>
              <p className="font-medium text-gray-900 mt-0.5">
                {formatDate(connectionStatus.lastSync)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Token Expires</p>
              <p
                className={`font-medium mt-0.5 ${
                  isTokenExpiringSoon() ? 'text-amber-600' : 'text-gray-900'
                }`}
              >
                {formatDate(connectionStatus.tokenExpiry)}
                {isTokenExpiringSoon() && (
                  <span className="ml-1 text-xs">⚠️</span>
                )}
              </p>
            </div>
          </div>

          {isTokenExpiringSoon() && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>
                Your connection will expire soon. Consider reconnecting to refresh
                the token.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function StatusIndicator({ status }: { status: 'connected' | 'disconnected' }) {
  return (
    <span
      className={`w-2.5 h-2.5 rounded-full ${
        status === 'connected'
          ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]'
          : 'bg-gray-300'
      }`}
    />
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export default QBOConnection
