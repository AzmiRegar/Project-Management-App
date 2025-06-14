import ProjectSetting from '@/app/components/ProjectSetting'

interface PageProps {
  params: { id: string }
}

export default function ProjectDetailPage({ params }: PageProps) {
  return <ProjectSetting projectId={params.id} />
}