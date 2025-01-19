import { WorkspaceSetup } from '@/components/dashboard/WorkspaceSetup'

export default function WorkspaceSetupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="max-w-2xl w-full p-4">
                <WorkspaceSetup />
            </div>
        </div>
    )
}