'use client'

import { useEffect, useState } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import Sidebar from "@/app/components/Sidebar"
import { verifyJwt } from '@/lib/jwt'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import TaskAnalyticsChart from '@/app/components/TaskAnalyticsChart'

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

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE"

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
    const [tasksByStatus, setTasksByStatus] = useState<Record<string, Task[]>>({
        TODO: [],
        IN_PROGRESS: [],
        DONE: [],
    })
    const [userEmail, setUserEmail] = useState('User')
    const [userId, setUserId] = useState('')
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
    const [taskTitle, setTaskTitle] = useState('')
    const [taskDescription, setTaskDescription] = useState('')
    const [taskStatus, setTaskStatus] = useState<TaskStatus>('TODO')
    const [assigneeId, setAssigneeId] = useState("")
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const handleOpenTaskModal = (task: Task) => {
        setSelectedTask(task);
        setIsTaskDetailModalOpen(true);
        setIsEditModalOpen(false);
    };

    const openEditTaskModal = (task: Task) => {
        setSelectedTask(task)
        setTaskTitle(task.title)
        setTaskDescription(task.description)
        setTaskStatus(task.status)
        setIsEditModalOpen(true)
    }


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

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/project/${projectId}`)
            const data = await res.json()
            setProject(data.project)

            const grouped: Record<string, Task[]> = {
                TODO: [],
                IN_PROGRESS: [],
                DONE: []
            }
            data.project.tasks.forEach((task: Task) => {
                grouped[task.status]?.push(task)
            })
            setTasksByStatus(grouped)
        } catch (e) {
            console.error("Failed to fetch project:", e)
        }
    }

    useEffect(() => {
        if (projectId) fetchProject()
    }, [projectId])

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result
        if (!destination || source.droppableId === destination.droppableId) return

        const movedTask = tasksByStatus[source.droppableId].find(t => t.id === draggableId)
        if (!movedTask) return

        const updated = { ...tasksByStatus }
        updated[source.droppableId] = updated[source.droppableId].filter(t => t.id !== draggableId)
        updated[destination.droppableId] = [
            { ...movedTask, status: destination.droppableId as Task["status"] },
            ...updated[destination.droppableId]
        ]
        setTasksByStatus(updated)

        await fetch(`/api/task/${draggableId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: destination.droppableId })
        })
    }

    const handleAddTask = async () => {
        if (!taskTitle || !taskDescription) return

        try {
            const res = await fetch(`/api/task`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: taskTitle,
                    description: taskDescription,
                    status: taskStatus,
                    projectId,
                    assigneeId: userId,
                }),
            })

            if (res.ok) {
                setIsTaskModalOpen(false)
                setTaskTitle('')
                setTaskDescription('')
                setTaskStatus('TODO')
                fetchProject()
            } else {
                const error = await res.json()
                console.error('Gagal menambahkan task:', error.message)
            }
        } catch (err) {
            console.error('Error saat menambahkan task:', err)
        }
    }


    const handleDeleteTask = async (taskId: string) => {
        try {
            const res = await fetch(`/api/task/${taskId}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                setIsTaskDetailModalOpen(false)
                fetchProject()
            } else {
                alert('Gagal menghapus task')
            }
        } catch (err) {
            console.error('Error delete:', err)
        }
    }

    const handleEditTask = async () => {
        if (!selectedTask) return

        try {
            const res = await fetch(`/api/task/${selectedTask.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: taskTitle,
                    description: taskDescription,
                    status: taskStatus,
                    assigneeId: assigneeId,
                }),
            })

            if (res.ok) {
                setIsTaskDetailModalOpen(false)
                setSelectedTask(null)
                setIsEditModalOpen(false)
                setTaskTitle('')
                setTaskDescription('')
                setTaskStatus('TODO')
                setAssigneeId('')
                fetchProject()
            } else {
                const error = await res.json()
                console.error('Gagal update:', error.message)
            }
        } catch (err) {
            console.error('Error saat mengupdate task:', err)
        }
    }




    const columns = ["TODO", "IN_PROGRESS", "DONE"]
    const columnLabels: Record<string, string> = {
        TODO: "Akan Dikerjakan",
        IN_PROGRESS: "Proses",
        DONE: "Selesai"
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
                            ID Pemilik: {project?.ownerId || "-"} •
                            Dibuat: {project ? new Date(project.createdAt).toLocaleDateString("id-ID") : "-"} •
                            Diperbarui: {project ? new Date(project.updatedAt).toLocaleDateString("id-ID") : "-"}
                        </p>
                    </div>
                    {userId === project?.ownerId && (
                        <Link
                            href={`/projects/${project.id}/settings`}
                            className="text-white hover:text-gray-200 transition"
                        >
                            <Settings size={24} />
                        </Link>
                    )}
                </div>

                {project?.id && <TaskAnalyticsChart projectId={project.id} />}

                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {columns.map((status) => (
                            <Droppable droppableId={status} key={status}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="bg-[#f2f2f2] p-4 rounded-md min-h-[300px]"
                                    >
                                        <h2 className="text-lg font-semibold mb-2">{columnLabels[status]}</h2>
                                        {tasksByStatus[status].length === 0 && (
                                            <p className="text-sm text-gray-500 text-left">Belum ada tugas.</p>
                                        )}

                                        {tasksByStatus[status].map((task, index) => (
                                            <Draggable draggableId={task.id} index={index} key={task.id}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => handleOpenTaskModal(task)}
                                                        className="bg-white p-3 rounded shadow mb-3 cursor-pointer hover:bg-gray-100 transition"
                                                    >
                                                        <p className="font-medium">{task.title}</p>
                                                        <p className="text-sm text-gray-600">{task.description}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            by: {task.assigneeId || "Unassigned"}
                                                        </p>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>

                <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg z-50"
                >
                    + Tambah Task
                </button>
            </main>

            {isTaskDetailModalOpen && selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                            onClick={() => setIsTaskDetailModalOpen(false)}
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-semibold mb-4">{selectedTask.title}</h2>
                        <p className="text-sm text-gray-600 mb-2">{selectedTask.description}</p>
                        <p className="text-sm text-gray-600 mb-2">Status: {selectedTask.status}</p>
                        <p className="text-sm text-gray-600 mb-4">
                            Assignee ID: {selectedTask.assigneeId || 'Unassigned'}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">createdAt {selectedTask.createdAt}</p>
                        <p className="text-sm text-gray-600 mb-2">updatedAt: {selectedTask.updatedAt}</p>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                onClick={() => {
                                    setIsTaskDetailModalOpen(false)
                                    openEditTaskModal(selectedTask) // kamu harus punya fungsi ini
                                }}
                            >
                                Edit
                            </button>
                            <button
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                onClick={() => handleDeleteTask(selectedTask.id)} // pastikan kamu buat ini
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-semibold mb-4">Edit Task</h2>

                        <input
                            type="text"
                            placeholder="Judul Task"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            className="w-full border px-3 py-2 rounded mb-3"
                        />
                        <textarea
                            placeholder="Deskripsi Task"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            className="w-full border px-3 py-2 rounded mb-3"
                        />
                        <select
                            value={taskStatus}
                            onChange={(e) =>
                                setTaskStatus(e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE')
                            }
                            className="w-full border px-3 py-2 rounded mb-4"
                        >
                            <option value="TODO">TODO</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="DONE">DONE</option>
                        </select>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleEditTask}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isTaskModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Tambah Task Baru</h2>

                        <input
                            type="text"
                            placeholder="Judul Task"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            className="w-full border px-3 py-2 rounded mb-3"
                        />

                        <textarea
                            placeholder="Deskripsi Task"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            className="w-full border px-3 py-2 rounded mb-3"
                        />

                        <select
                            value={taskStatus}
                            onChange={(e) =>
                                setTaskStatus(e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE')
                            }
                            className="w-full border px-3 py-2 rounded mb-3"
                        >
                            <option value="TODO">TODO</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="DONE">DONE</option>
                        </select>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsTaskModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Batal
                            </button>

                            <button
                                onClick={handleAddTask}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    )
}