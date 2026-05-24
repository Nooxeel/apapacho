import React, { useId } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

/**
 * Accessible <input> wrapper.
 *
 * Accessibility:
 *   - When `label` is set we auto-associate it with the input via a stable id
 *     (consumer-provided `id` wins, otherwise we derive one with useId()).
 *   - Errors live in a <p role="alert" aria-live="assertive"> sibling whose
 *     id is wired through aria-describedby, so screen readers announce
 *     validation failures the moment they appear.
 *   - When no error is present but helperText is, the helper text is also
 *     wired via aria-describedby (no live region — just supplementary text).
 *   - `aria-invalid` is set whenever an error string is provided.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id: idProp,
      'aria-describedby': describedByProp,
      ...props
    },
    ref
  ) => {
    const reactId = useId()
    const inputId = idProp ?? `input-${reactId}`
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    // Compose aria-describedby: existing prop value + helper/error ids.
    const describedBy = [
      describedByProp,
      error ? errorId : undefined,
      !error && helperText ? helperId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-white/80 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
              'transition-all duration-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="assertive"
            className="mt-1.5 text-sm text-red-400"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-white/50">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
