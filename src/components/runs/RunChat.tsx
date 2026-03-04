'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { RunMessage } from '@/types'
import { timeAgo } from '@/lib/utils'

interface RunChatProps {
  runId: string
  currentUserId: string
}

export function RunChat({ runId, currentUserId }: RunChatProps) {
  const [messages, setMessages] = useState<RunMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    // Load existing messages
    async function load() {
      const { data } = await supabase
        .from('run_messages')
        .select('*, profile:profiles(display_name, avatar_url)')
        .eq('run_id', runId)
        .order('created_at', { ascending: true })
        .limit(100)

      setMessages((data as RunMessage[]) ?? [])
    }
    load()

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${runId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'run_messages',
          filter: `run_id=eq.${runId}`,
        },
        async (payload) => {
          // Fetch with profile join
          const { data } = await supabase
            .from('run_messages')
            .select('*, profile:profiles(display_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data as RunMessage])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [runId])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setInput('')

    const supabase = createClient()
    await supabase.from('run_messages').insert({
      run_id: runId,
      user_id: currentUserId,
      message: text,
    })

    setSending(false)
  }

  return (
    <div className="flex flex-col">
      {/* Messages */}
      <div className="space-y-4 mb-4 max-h-72 overflow-y-auto px-4 py-2">
        {messages.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-4">
            No messages yet. Say hi! 👋
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.user_id === currentUserId
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              {!isMe && (
                <div className="flex-shrink-0">
                  {msg.profile?.avatar_url ? (
                    <Image
                      src={msg.profile.avatar_url}
                      alt={msg.profile.display_name}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#1B3A5C] flex items-center justify-center text-white text-xs font-bold">
                      {msg.profile?.display_name?.[0] ?? '?'}
                    </div>
                  )}
                </div>
              )}
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isMe && (
                  <span className="text-xs text-slate-400 mb-0.5">{msg.profile?.display_name}</span>
                )}
                <div
                  className={`px-3 py-2 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-[#FF6B2C] text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-900 rounded-tl-sm'
                  }`}
                >
                  {msg.message}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">{timeAgo(msg.created_at)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 px-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message the group…"
          maxLength={300}
          className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FF6B2C] text-white disabled:opacity-50 transition-opacity"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}
