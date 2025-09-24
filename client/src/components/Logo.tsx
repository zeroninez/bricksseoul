import classNames from 'classnames'

export const Logo = ({ className }: { className?: string }) => {
  return <div className={classNames('font-bold leading-none tracking-[10%]', className)}>WELLNCHER</div>
}
