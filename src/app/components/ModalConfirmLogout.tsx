'use client'

import React from 'react'

type ModalConfirmLogoutProps = {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

export default function ModalConfirmLogout({
    isOpen,
    onClose,
    onConfirm,
}: ModalConfirmLogoutProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                <h2 className="text-lg font-semibold mb-4">Konfirmasi Logout</h2>
                <p className="mb-6">Apakah kamu yakin ingin logout?</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    )
}
