import classNames from 'classnames'

interface TabsProps {
  tabs: readonly string[]
  currentDetailTab: string
  onHandleClick: (tab: any) => void
}

export const Tabs = ({ tabs, currentDetailTab, onHandleClick }: TabsProps) => {
  return (
    <>
      <div className='w-full h-fit flex flex-row sticky top-[200px] bg-background z-10'>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onHandleClick(tab)}
            className={classNames(
              'flex-1 h-fit py-3 flex items-center justify-center text-base font-medium border-b-2 transition-all',
              currentDetailTab === tab ? 'border-primary text-primary' : 'border-stone-200 text-stone-500',
            )}
          >
            {tab}
          </button>
        ))}
      </div>
    </>
  )
}
