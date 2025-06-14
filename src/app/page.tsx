'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))?.split('=')[1]

        if (token) {
            setIsLoggedIn(true)
        }
    }, [])

    const handleMasuk = () => {
        router.push('/login')
    }

    const handleDaftar = () => {
        router.push('/register')
    }

    const handleDashboard = () => {
        router.push('/dashboard')
    }

    return (
        <main className="min-h-screen bg-white flex items-center justify-center font-nunito px-4">
            <div className="text-center max-w-xl">
                <h1 className="text-4xl md:text-5xl font-bold text-[#0575E6] mb-4 animate-fade-in-down">
                    🚀 Project Management App
                </h1>
                <p className="text-gray-600 text-lg mb-8 animate-fade-in-up">
                    Kelola tugas, tim, dan progres proyek kamu dengan mudah dan rapi!
                </p>

                {isLoggedIn ? (
                    <button
                        onClick={handleDashboard}
                        className="px-6 py-3 rounded bg-[#0575E6] text-white font-semibold hover:bg-blue-700 transition duration-200"
                    >
                        Masuk ke Dashboard
                    </button>
                ) : (
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleMasuk}
                            className="px-6 py-3 rounded bg-[#0575E6] text-white font-semibold hover:bg-blue-700 transition duration-200"
                        >
                            Masuk
                        </button>
                        <button
                            onClick={handleDaftar}
                            className="px-6 py-3 rounded border border-[#0575E6] text-[#0575E6] font-semibold hover:bg-[#0575E6] hover:text-white transition duration-200"
                        >
                            Daftar
                        </button>
                    </div>
                )}
            </div>
        </main>
    )
}
