import { Nav } from '@/components/nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto w-full px-4 py-8">{children}</main>
    </>
  )
}
