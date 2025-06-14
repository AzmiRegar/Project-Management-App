'use client'

import { useState, useEffect } from 'react'
import { login, register } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type AuthType = 'login' | 'register'

export default function AuthForm({ type }: { type: AuthType }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isMounted, setIsMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            setError(null)
            if (type === 'login') {
                const result = await login(email, password)
                if (result && result.token && result.user) {
                    localStorage.setItem('token', result.token)
                    localStorage.setItem('userId', result.user.id)
                    localStorage.setItem('userEmail', result.user.email)
                    router.push('/dashboard')
                }
            } else {
                await register(email, password)
                router.push('/login')
            }

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Terjadi kesalahan.')
            }
        }
    }

    if (!isMounted) return null

    return (
        <form onSubmit={handleSubmit} className="font-nunito bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-2 text-black">
                {type === 'login' ? 'Masuk' : 'Daftar Akun'}
            </h1>
            <p className="mb-4 text-gray-600">Masukkan informasi Anda di bawah ini</p>

            <input
                type="email"
                autoComplete="email"
                placeholder="Alamat Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded mb-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="password"
                autoComplete="current-password"
                placeholder="Kata Sandi"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded mb-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <button type="submit" className="bg-blue-600 text-white w-full p-3 rounded hover:bg-blue-700">
                {type === 'login' ? 'Masuk' : 'Daftar'}
            </button>

            {type === 'login' && (
                <p className="mt-4 text-sm text-center text-gray-600">
                    Belum punya akun?{' '}
                    <Link href="/register" className="text-blue-600 hover:underline">
                        Daftar sekarang
                    </Link>
                </p>
            )}

            {type === 'register' && (
                <p className="mt-4 text-sm text-center text-gray-600">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Login sekarang
                    </Link>
                </p>
            )}
        </form>
    )
}
