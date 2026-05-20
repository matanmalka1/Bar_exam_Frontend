import type { ReactNode } from 'react'

interface ErrorStateProps {
  title?: string
  message?: string
  action?: ReactNode
}

const ErrorState = ({ title = 'שגיאה', message, action }: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
    <h3 className="text-lg font-semibold text-red-700">{title}</h3>
    {message && <p className="text-sm text-gray-600">{message}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
)

export default ErrorState
