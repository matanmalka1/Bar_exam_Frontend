import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
}

const Chip = ({ selected, className, type = 'button', ...rest }: ChipProps) => (
  <button
    type={type}
    aria-pressed={selected}
    className={cn(
      'rounded-full border px-3 py-1 text-sm transition-colors',
      selected
        ? 'border-blue-600 bg-blue-600 text-white'
        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
      className,
    )}
    {...rest}
  />
)

export default Chip
