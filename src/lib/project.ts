export async function getUserProjects() {
  const res = await fetch('/api/project', {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Gagal mengambil project')
  }

  const data = await res.json()
  return data.project
}
