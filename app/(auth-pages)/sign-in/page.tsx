import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SignInForm } from '@/components/auth/SignInForm'

export default async function SignInPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  })

  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/app/engage')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <SignInForm />
    </div>
  )
}