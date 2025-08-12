export const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <section className={`flex flex-col gap-4 border-b border-gray-200 px-4 pt-8 pb-20 ${className}`}>
      {children}
    </section>
  )
}
