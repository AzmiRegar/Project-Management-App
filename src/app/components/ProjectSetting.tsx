"use client"
import { useEffect, useState } from "react"
import Sidebar from "@/app/components/Sidebar"
import { verifyJwt } from '@/lib/jwt'

interface Task {
    id: string
    title: string
    description: string
    status: "TODO" | "IN_PROGRESS" | "DONE"
    assigneeId: string
    assignee?: {
        id: string
        email: string
    }
    createdAt: string
    updatedAt: string
}

interface Project {
    id: string
    name: string
    ownerId: string
    createdAt: string
    updatedAt: string
    tasks: Task[]
}

export default function ProjectBoard({ projectId }: { projectId: string }) {
    const [project, setProject] = useState<Project | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [editName, setEditName] = useState("")
    const [userId, setUserId] = useState<string | null>(null)
    const [userEmail, setUserEmail] = useState('User')
    const [memberId, setMemberId] = useState('')
    const [memberMessage, setMemberMessage] = useState('')
    const [members, setMembers] = useState<{ id: string; user: { id: string; email: string } }[]>([])
    const [memberToDelete, setMemberToDelete] = useState<{ id: string; email: string } | null>(null)

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
    }, [])


    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]))
            setUserId(payload?.userId || null)
        }
    }, [])

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/project/${projectId}`)
            const data = await res.json()
            setProject(data.project)

            const memberRes = await fetch(`/api/project/${projectId}/invite`)
            const memberData = await memberRes.json()
            setMembers(memberData.members)
        } catch (e) {
            console.error("Failed to fetch project or members:", e)
        }
    }

    useEffect(() => {
        fetchProject()
    }, [projectId])

    const handleEditProject = async () => {
        if (!editName.trim() || !project) return
        try {
            const res = await fetch(`/api/project/${project.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: editName })
            })
            if (res.ok) {
                const updated = await res.json()
                setProject(updated.project)
                setShowEditModal(false)
            }
        } catch (err) {
            console.error('Edit project failed:', err)
        }
    }

    const handleDeleteProject = async () => {
        if (!project) return
        try {
            const res = await fetch(`/api/project/${project.id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                window.location.href = "/dashboard"
            }
        } catch (err) {
            console.error('Delete project failed:', err)
        }
    }

    const handleAddMember = async () => {
        if (!memberId || !project) return

        try {
            const res = await fetch(`/api/project/${project.id}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: memberId,
                    projectId: project.id,
                }),
            })

            if (res.ok) {
                setMemberMessage('Akses berhasil diberikan.')
                setMemberId('')
                fetchProject()
            } else {
                const err = await res.json()
                setMemberMessage(err.message || 'Gagal menambahkan akses.')
            }
        } catch (err) {
            console.error('Tambah member gagal:', err)
            setMemberMessage('Terjadi kesalahan.')
        }
    }

    const handleRemoveMember = async (userIdToRemove: string) => {
        if (!project) return

        try {
            const res = await fetch(`/api/project/${project.id}/invite`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userIdToRemove }),
            })

            if (res.ok) {
                setMembers((prev) => prev.filter((m) => m.user.id !== userIdToRemove))
            } else {
                const err = await res.json()
                console.error("Gagal hapus member:", err.message)
            }
        } catch (err) {
            console.error("Gagal hapus member:", err)
        }
    }

    return (
        <div className="min-h-screen flex font-nunito bg-white text-black">
            <aside className="w-1/5 bg-white p-4 border-r border-gray-300 border-[1px]">
                <Sidebar />
            </aside>

            <main className="w-4/5 p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold"> 👋 Hai, {userEmail} ({userId})</h2>
                </div>
                <div className="bg-[#0575E6] text-white p-6 rounded-md mb-6 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">📁 {project?.name}</h1>
                        <p className="text-sm mt-1">
                            ID Project: {project?.id || "-"} •
                            ID Pemilik: {project?.ownerId || "-"} •
                            Dibuat: {project ? new Date(project.createdAt).toLocaleDateString("id-ID") : "-"} •
                            Diperbarui: {project ? new Date(project.updatedAt).toLocaleDateString("id-ID") : "-"}
                        </p>
                    </div>
                    {userId && project?.ownerId === userId && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setEditName(project.name)
                                    setShowEditModal(true)
                                }}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                                Hapus
                            </button>
                        </div>
                    )}
                </div>

                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Edit Nama Project</h2>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full border px-3 py-2 rounded mb-3 text-black"
                                placeholder="Nama baru"
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-200 rounded">
                                    Batal
                                </button>
                                <button onClick={handleEditProject} className="px-4 py-2 bg-green-500 text-white rounded">
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded shadow-lg w-full max-w-md text-center">
                            <p className="text-gray-800 mb-4">Apakah kamu yakin ingin menghapus project ini?</p>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 rounded">
                                    Batal
                                </button>
                                <button onClick={handleDeleteProject} className="px-4 py-2 bg-red-500 text-white rounded">
                                    Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {userId === project?.ownerId && members.length >= 0 && (
                    <div className="mt-6 bg-white p-4 rounded shadow-md">
                        <h3 className="text-lg font-semibold mb-4">👥 Daftar Akses Anggota</h3>
                        <input
                            type="text"
                            placeholder="Masukkan user ID"
                            value={memberId}
                            onChange={(e) => setMemberId(e.target.value)}
                            className="w-full border px-3 py-2 rounded mb-3 text-black"
                        />
                        <button
                            onClick={handleAddMember}
                            className="bg-[#0575E6] text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Tambah Akses
                        </button>
                        {memberMessage && <p className="text-sm mt-2 text-gray-700">{memberMessage}</p>}

                        {/* Tabel anggota */}
                        {members.length > 0 && (
                            <table className="w-full mt-4 border text-sm">
                                <thead>
                                    <tr className="bg-[#f2f2f2]">
                                        <th className="border px-2 py-1">#</th>
                                        <th className="border px-2 py-1">User ID</th>
                                        <th className="border px-2 py-1">Email</th>
                                        <th className="border px-2 py-1 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((m, i) => (
                                        <tr key={m.id}>
                                            <td className="border px-2 py-1 text-center">{i + 1}</td>
                                            <td className="border px-2 py-1">{m.user.id}</td>
                                            <td className="border px-2 py-1">{m.user.email}</td>
                                            <td className="border px-2 py-1 text-center">
                                                <button
                                                    onClick={() => setMemberToDelete({ id: m.user.id, email: m.user.email })}
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                                                >
                                                    Hapus
                                                </button>
                                                {memberToDelete && (
                                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                                        <div className="bg-white p-6 rounded shadow-lg w-full max-w-md text-center">
                                                            <p className="text-gray-800 mb-4">
                                                                Yakin ingin menghapus akses untuk <strong>{memberToDelete.email}</strong>?
                                                            </p>
                                                            <div className="flex justify-center gap-4">
                                                                <button
                                                                    onClick={() => setMemberToDelete(null)}
                                                                    className="px-4 py-2 bg-gray-200 rounded"
                                                                >
                                                                    Batal
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        await handleRemoveMember(memberToDelete.id)
                                                                        setMemberToDelete(null)
                                                                        fetchProject()
                                                                    }}
                                                                    className="px-4 py-2 bg-red-500 text-white rounded"
                                                                >
                                                                    Ya, Hapus
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

            </main>
        </div>
    )

}