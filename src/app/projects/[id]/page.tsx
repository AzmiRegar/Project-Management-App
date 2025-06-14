import ProjectBoard from '@/app/components/ProjectBoard'

interface PageProps {
  params: { id: string }
}

export default function ProjectDetailPage({ params }: PageProps) {
  return <ProjectBoard projectId={params.id} />
}