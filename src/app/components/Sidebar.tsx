'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import ModalConfirmLogout from './ModalConfirmLogout'

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [canGoBack, setCanGoBack] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const previousPath = sessionStorage.getItem('previousPath')
        if (previousPath && previousPath !== '/dashboard') {
            setCanGoBack(true)
        } else {
            setCanGoBack(false)
        }

        sessionStorage.setItem('previousPath', pathname)
    }, [pathname])

    const handleBack = () => {
        if (canGoBack) {
            router.back()
        } else {
            router.push('/dashboard')
        }
    }

    const handleLogout = () => {
        // Misal kamu ingin menghapus token dan redirect ke login
        localStorage.removeItem('token') // atau sesuaikan dengan cara kamu simpan token
        router.push('/login')
    }

    return (
        <>
            <aside className="flex flex-col gap-4 h-full bg-white">
                <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">Project Managment</h1>
                <nav className="flex flex-col gap-2">
                    <Link
                        href="/dashboard"
                        className={cn(
                            'px-3 py-2 rounded text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition',
                            pathname === '/dashboard' && 'bg-blue-500 text-white'
                        )}
                    >
                        Dashboard
                    </Link>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-3 py-2 rounded text-red-600 hover:bg-red-100 hover:text-red-800 transition text-left"
                    >
                        Logout
                    </button>
                </nav>
                <button
                    onClick={handleBack}
                    className="fixed bottom-4 left-4 bg-[#0575E6] text-white hover:bg-[#0575E6]-300 px-4 py-2 rounded shadow"
                >
                    ← Kembali
                </button>
            </aside>
            <ModalConfirmLogout
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleLogout}
            />
        </>
    )
}
