import type { ReactNode } from 'react'
import Lnb from '@/components/layout/Lnb'

interface ChatLayoutProps {
  children: ReactNode
}

const ChatLayout = ({ children }: ChatLayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      <Lnb />
      <main className="flex-1 overflow-auto transition-all duration-300">
        {children}
      </main>
    </div>
  )
}

export default ChatLayout
