'use client'

import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale)

export default function TaskAnalyticsChart({ projectId }: { projectId: string }) {
    const [data, setData] = useState({ TODO: 0, IN_PROGRESS: 0, DONE: 0 })

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(`/api/project/${projectId}/analytic`)
            const result = await res.json()
            setData(result.data)
        }

        fetchData()
    }, [projectId])

    const chartData = {
        labels: ['Todo', 'In Progress', 'Done'],
        datasets: [
            {
                label: 'Jumlah Task',
                data: [data.TODO, data.IN_PROGRESS, data.DONE],
                backgroundColor: ['#FFB400', '#007BFF', '#28A745'],
            },
        ],
    }


    return (
        <div className="bg-white p-6 rounded shadow-md">
            <h3 className="text-lg font-bold mb-4 text-center">📈 Task Analytics</h3>
            <div className="flex justify-center">
                <div className="w-[500px] h-[250px]">
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
