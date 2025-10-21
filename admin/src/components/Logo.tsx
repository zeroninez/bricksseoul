import classNames from 'classnames'

export const Logo = ({ className, onClick }: { className?: string; onClick?: () => void }) => {
  return (
    <div className={classNames('font-bold leading-none tracking-[7%]', className)} onClick={onClick}>
      WELLNCHER
    </div>
  )
}
