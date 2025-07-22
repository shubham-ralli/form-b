
"use client"

export default function LiveFormLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}
