import classNames from 'classnames'

export const Logo = ({ className, onClick }: { className?: string; onClick?: () => void }) => {
  return (
    <div className={classNames('font-semibold leading-none font-serif tracking-[7%]', className)} onClick={onClick}>
      WELLSTAYN
    </div>
  )
}
