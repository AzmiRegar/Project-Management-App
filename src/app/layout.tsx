import './globals.css'
import { Nunito } from 'next/font/google'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

export const metadata = {
  title: 'Login - Management App',
  description: 'Halaman login pengguna',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={nunito.className}>
      <body>{children}</body>
    </html>
  )
}
