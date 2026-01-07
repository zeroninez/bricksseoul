import classNames from 'classnames'
import MainLogo from 'svgs/logo.svg'

interface LogoProps {
  cursor?: 'pointer' | 'default'
  height?: number
  className?: string
  onClick?: () => void
}

export const Logo = ({ className, onClick, height = 16, cursor = 'default' }: LogoProps) => {
  return (
    <MainLogo
      style={{
        cursor: cursor || (onClick ? 'pointer' : 'default'),
        width: 'auto',
        height: height ? `${height}px` : undefined,
      }}
      className={classNames('', className)}
      onClick={onClick}
    />
  )
}
