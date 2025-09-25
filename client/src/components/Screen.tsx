import { HEADER_HEIGHT } from '@/theme/constants'
import classNames from 'classnames'

export const Screen = ({
  children,
  className,
  fixed,
  style,
}: {
  children: React.ReactNode
  className?: string
  fixed?: boolean
  style?: React.CSSProperties
}) => {
  return (
    <div
      style={{
        ...style,
      }}
      className={classNames('w-full min-h-dvh', fixed ? 'h-dvh overflow-hidden' : 'h-fit pb-24', className)}
    >
      {children}
    </div>
  )
}
