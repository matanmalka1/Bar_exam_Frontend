import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400',
  ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 disabled:text-gray-400',
}

const Button = ({
  variant = 'primary',
  fullWidth,
  className,
  type = 'button',
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={cn(
      'inline-flex items-center justify-center rounded-xl px-4 py-3 text-base font-medium transition-colors disabled:cursor-not-allowed',
      VARIANT[variant],
      fullWidth && 'w-full',
      className,
    )}
    {...rest}
  />
)

export default Button
