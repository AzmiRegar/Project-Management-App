'use client'

import Sidebar from './Sidebar'
import { useEffect, useState } from 'react'
import { verifyJwt } from '@/lib/jwt'

interface Project {
    id: string
    name: string
    ownerId: string
    createdAt: string
    updatedAt: string
}

interface Task {
    id: string
    title: string
    status: string
    assigneeId: string
    projectId: string
    createdAt: string
    updatedAt: string
}

export default function DashboardLayout() {
    const [time, setTime] = useState('')
    const [greeting, setGreeting] = useState('')
    const [userEmail, setUserEmail] = useState('User')
    const [userId, setUserId] = useState('')
    const [projects, setProjects] = useState<Project[]>([])
    const [totalTaskCount, setTotalTaskCount] = useState(0)
    const [newProjectName, setNewProjectName] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [formError, setFormError] = useState('')
    const [showConfirm, setShowConfirm] = useState(false)
    

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))

            const hour = now.getHours()
            if (hour < 12) setGreeting('Selamat Pagi')
            else if (hour < 18) setGreeting('Selamat Siang')
            else setGreeting('Selamat Malam')
        }

        updateTime()
        const interval = setInterval(updateTime, 1000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1]

        const localId = localStorage.getItem('userId')
        if (localId) setUserId(localId)

        if (token) {
            try {
                const payload = verifyJwt(token)
                if (payload?.email) setUserEmail(payload.email)
            } catch (e) {
                console.error('Invalid token', e)
            }
        }

        const fetchData = async () => {
            try {
                const projectRes = await fetch('/api/project')
                const projectData = await projectRes.json()
                setProjects(projectData.project)

                const taskRes = await fetch('/api/task')
                const taskData = await taskRes.json()

                const userProjectIds = projectData.project.map((p: Project) => p.id)
                const filteredTasks = taskData.tasks.filter((t: Task) =>
                    userProjectIds.includes(t.projectId)
                )

                setTotalTaskCount(filteredTasks.length)
            } catch (err) {
                console.error('Error fetching data:', err)
            }
        }
        fetchData()
    }, [])

    const handleConfirmCreate = async () => {
        try {
            const res = await fetch('/api/project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newProjectName }),
            })

            if (!res.ok) throw new Error('Gagal membuat project')

            const data = await res.json()
            setProjects(prev => [...prev, data.project])
            setNewProjectName('')
            setShowModal(false)
            setShowConfirm(false)
        } catch (err) {
            console.error('Create project failed:', err)
            setFormError('Terjadi kesalahan saat menambahkan project')
            setShowConfirm(false)
        }
    }

    return (
        <div className="min-h-screen flex font-nunito bg-white text-black">
            {/* Sidebar */}
            <aside className="w-1/5 bg-white p-4 border-r border-gray-300 border-[1px]">
                <Sidebar />
            </aside>

            {/* Main Content */}
            <main className="w-4/5 p-6 space-y-6">
                {/* Header */}
                <div className="bg-[#0575E6] text-white p-6 rounded-md flex justify-between items-start">
                    <div>
                        <p className="text-sm">
                            {new Date().toLocaleDateString('id-ID', {
                                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                            })}
                        </p>
                        <p className="text-3xl font-bold mt-1">{time}</p>
                    </div>
                </div>

                {/* Greeting Section */}
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold"> 👋 Hai, {userEmail} ({userId}) - {greeting}</h2>
                </div>

                {/* Stat Boxes */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#f2f2f2] p-4 rounded-md text-center">
                        <p className="text-lg font-semibold">{projects.length} All Project</p>
                    </div>
                    <div className="bg-[#f2f2f2] p-4 rounded-md text-center">
                        <p className="text-lg font-semibold"> {totalTaskCount} All Task</p>
                    </div>
                </div>

                {/* Project Section */}
                <div className="bg-[#f2f2f2] p-6 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold">PROJECT</h3>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-[#0575E6] text-white px-4 py-1 rounded hover:bg-blue-700"
                        >
                            + Tambah
                        </button>

                        {showModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
                                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                                    <h2 className="text-xl font-bold mb-4">Tambah Project</h2>
                                    <input
                                        type="text"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="w-full border px-3 py-2 rounded mb-3 text-black"
                                        placeholder="Nama Project"
                                    />
                                    {formError && <p className="text-sm text-red-500 mb-3">{formError}</p>}
                                    <div className="flex justify-end gap-2">
                                        <button
                                            className="bg-gray-300 px-4 py-2 rounded"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Batal
                                        </button>
                                        <button
                                            className="bg-[#0575E6] text-white px-4 py-2 rounded"
                                            onClick={() => {
                                                if (!newProjectName.trim()) {
                                                    setFormError('Nama project wajib diisi')
                                                    return
                                                }
                                                setShowConfirm(true)
                                                setShowModal(false)
                                            }}
                                        >
                                            Simpan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {showConfirm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-10 z-50">
                                <div className="bg-white p-5 w-[380px] rounded-lg shadow-lg animate-fade-in text-center">
                                    <p className="text-gray-800 font-medium mb-4">
                                        Apakah kamu yakin ingin membuat project ini?
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => setShowConfirm(false)}
                                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleConfirmCreate}
                                            className="px-4 py-2 bg-[#0575E6] text-white rounded hover:bg-blue-700"
                                        >
                                            Ya, simpan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>


                    {/* List ProjectCard di sini */}
                    {projects.length === 0 ? (
                        <p className="text-sm text-gray-600">Belum ada project.</p>
                    ) : (
                        <ul className="grid grid-cols-1 gap-3">
                            {projects.map(project => (
                                <li
                                    key={project.id}
                                    className="bg-white p-4 rounded shadow hover:bg-gray-50 transition cursor-pointer"
                                    onClick={() => window.location.href = `/projects/${project.id}`}
                                >
                                    <p className="font-semibold text-lg">{project.name}</p>
                                    <p className="text-sm text-gray-500"> ID Project: {project.id} • Dibuat: {new Date(project.createdAt).toLocaleDateString('id-ID')} • Diperbarui: {new Date(project.updatedAt).toLocaleDateString('id-ID')}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    )
}
