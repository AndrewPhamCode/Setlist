import { Sidebar } from '@/components/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-6 xl:px-10 py-6 lg:py-8 pb-24 lg:pb-8">
        {children}
      </main>
    </div>
  )
}
