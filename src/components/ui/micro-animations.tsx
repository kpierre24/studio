import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  buttonPress,
  gentleHover,
  cardHover,
  formSubmitting,
  loadingDots,
  celebrationBounce,
  checkmarkDraw,
  pageSlideLeft,
  pageSlideRight,
  pageFade,
  notificationSlideIn,
  inputFocus,
  iconSpin,
  tooltipVariants
} from "@/lib/animations"

// Animated Button Component
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'gentle' | 'press'
  isLoading?: boolean
  isSuccess?: boolean
  children: React.ReactNode
}

export function AnimatedButton({
  variant = 'default',
  isLoading = false,
  isSuccess = false,
  className,
  children,
  ...props
}: AnimatedButtonProps) {
  const getAnimationProps = () => {
    switch (variant) {
      case 'gentle':
        return gentleHover
      case 'press':
        return buttonPress
      default:
        return { ...gentleHover, ...buttonPress }
    }
  }

  return (
    <motion.button
      className={cn(
        "px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium transition-colors",
        "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isLoading && "cursor-not-allowed",
        className
      )}
      variants={formSubmitting}
      animate={isLoading ? "submitting" : isSuccess ? "success" : "initial"}
      disabled={isLoading || props.disabled}
      {...(getAnimationProps() as any)}
      {...(props as any)}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            className="flex items-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingDots />
            <span>Loading...</span>
          </motion.div>
        ) : isSuccess ? (
          <motion.div
            key="success"
            className="flex items-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CheckmarkIcon />
            <span>Success!</span>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// Animated Card Component
interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export function AnimatedCard({
  children,
  className,
  onClick,
  hover = true
}: AnimatedCardProps) {
  return (
    <motion.div
      className={cn(
        "bg-card border rounded-lg p-6 cursor-pointer",
        onClick && "hover:bg-accent/50",
        className
      )}
      {...(hover ? cardHover : {})}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// Loading Dots Component
export function LoadingDots() {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-current rounded-full"
          variants={loadingDots}
          animate="animate"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )
}

// Checkmark Icon Component
export function CheckmarkIcon({ className }: { className?: string }) {
  return (
    <motion.svg
      className={cn("w-5 h-5", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      variants={celebrationBounce}
      initial="initial"
      animate="animate"
    >
      <motion.path
        d="M20 6L9 17l-5-5"
        variants={checkmarkDraw}
        initial="initial"
        animate="animate"
      />
    </motion.svg>
  )
}

// Page Transition Wrapper
interface PageTransitionProps {
  children: React.ReactNode
  direction?: 'left' | 'right' | 'fade'
  className?: string
}

export function PageTransition({
  children,
  direction = 'fade',
  className
}: PageTransitionProps) {
  const getVariants = () => {
    switch (direction) {
      case 'left':
        return pageSlideLeft
      case 'right':
        return pageSlideRight
      default:
        return pageFade
    }
  }

  return (
    <motion.div
      className={className}
      variants={getVariants()}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

// Animated Input Component
interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function AnimatedInput({
  error = false,
  className,
  ...props
}: AnimatedInputProps) {
  return (
    <motion.input
      className={cn(
        "w-full px-3 py-2 border rounded-md bg-background",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        error && "border-destructive focus:ring-destructive",
        className
      )}
      variants={formSubmitting}
      animate={error ? "error" : "initial"}
      {...inputFocus}
      {...(props as any)}
    />
  )
}

// Notification Component
interface NotificationProps {
  type?: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  onClose?: () => void
  autoClose?: boolean
  duration?: number
}

export function Notification({
  type = 'info',
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000
}: NotificationProps) {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose, duration])

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <motion.div
      className={cn(
        "max-w-sm w-full border rounded-lg p-4 shadow-lg",
        getTypeStyles()
      )}
      variants={notificationSlideIn}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-start">
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          {message && (
            <p className="mt-1 text-sm opacity-90">{message}</p>
          )}
        </div>
        {onClose && (
          <motion.button
            className="ml-4 text-current opacity-70 hover:opacity-100"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

// Animated Icon Component
interface AnimatedIconProps {
  children: React.ReactNode
  spin?: boolean
  bounce?: boolean
  className?: string
  onClick?: () => void
}

export function AnimatedIcon({
  children,
  spin = false,
  bounce = false,
  className,
  onClick
}: AnimatedIconProps) {
  const getAnimationProps = () => {
    if (spin) return iconSpin
    if (bounce) return celebrationBounce
    return {}
  }

  return (
    <motion.div
      className={cn("inline-flex", onClick && "cursor-pointer", className)}
      onClick={onClick}
      {...getAnimationProps()}
    >
      {children}
    </motion.div>
  )
}

// Tooltip Component
interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({
  content,
  children,
  position = 'top'
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
    }
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              "absolute z-50 px-2 py-1 text-sm bg-gray-900 text-white rounded whitespace-nowrap",
              getPositionStyles()
            )}
            variants={tooltipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Form Success Animation Component
interface FormSuccessProps {
  show: boolean
  message?: string
  onComplete?: () => void
}

export function FormSuccess({
  show,
  message = "Success!",
  onComplete
}: FormSuccessProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="flex items-center space-x-2 text-green-600"
          variants={celebrationBounce}
          initial="initial"
          animate="animate"
          exit="exit"
          onAnimationComplete={onComplete}
        >
          <CheckmarkIcon />
          <span className="font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Achievement Badge Component
interface AchievementBadgeProps {
  title: string
  description?: string
  icon?: React.ReactNode
  show: boolean
  onClose?: () => void
}

export function AchievementBadge({
  title,
  description,
  icon,
  show,
  onClose
}: AchievementBadgeProps) {
  React.useEffect(() => {
    if (show && onClose) {
      const timer = setTimeout(onClose, 4000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-4 shadow-lg max-w-sm"
          variants={celebrationBounce}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="flex items-start space-x-3">
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-bold text-lg">🎉 {title}</h4>
              {description && (
                <p className="text-sm opacity-90 mt-1">{description}</p>
              )}
            </div>
            {onClose && (
              <motion.button
                className="text-white/80 hover:text-white"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}