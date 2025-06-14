import AuthForm from '@/app/components/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
      <AuthForm type="login" />
    </div>
  )
}
