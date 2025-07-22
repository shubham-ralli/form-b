
<old_str>export default function LiveFormLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}</old_str>
<new_str>"use client"

export default function LiveFormLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}</new_str>
