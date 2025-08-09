// FILE: app/drop/[token]/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DropHypePage({ 
  params 
}: { 
  params: { token: string } 
}) {
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Get request details
      const { data: request } = await supabase
        .from('hype_requests')
        .select('*, requester:users!requester_id(*)')
        .eq('token', params.token)
        .single()
      
      if (!request) throw new Error('Invalid request')
      
      // Create hype
      await supabase
        .from('hypes')
        .insert({
          to_user_id: request.requester_id,
          content,
          is_anonymous: isAnonymous,
          from_user_id: null // Would be set if user is logged in
        })
      
      // Mark request as completed
      await supabase
        .from('hype_requests')
        .update({ status: 'completed' })
        .eq('token', params.token)
      
      setSubmitted(true)
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong!')
    } finally {
      setLoading(false)
    }
  }
  
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔥</div>
          <h1 className="text-3xl font-bold mb-2">Hype Dropped!</h1>
          <p className="text-gray-600 mb-6">
            You just made someone's day!
          </p>
          
          <button
            onClick={() => router.push('/signup')}
            className="bg-gradient-to-r from-orange-400 to-red-600 text-white px-6 py-3 rounded-full font-semibold"
          >
            Get Your Own Hype Page
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">
            Drop a Hype! 🔥
          </h1>
          <p className="text-gray-600 mb-8">
            Tell everyone why your friend is awesome
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Your Hype (be specific and genuine!)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 border rounded-xl resize-none h-32"
                placeholder="Example: Sarah is the friend who remembers your coffee order, checks in when you're quiet, and somehow always knows the perfect meme to send..."
                minLength={100}
                maxLength={500}
                required
              />
              <div className="text-sm text-gray-500 mt-1">
                {content.length}/500 characters (min 100)
              </div>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Keep me anonymous</span>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading || content.length < 100}
              className="w-full bg-gradient-to-r from-orange-400 to-red-600 text-white py-4 rounded-full font-semibold text-lg disabled:opacity-50"
            >
              {loading ? 'Dropping...' : 'Drop This Hype 🔥'}
            </button>
          </form>
        </div>
        
        {/* Examples for inspiration */}
        <div className="mt-8 bg-white rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Need inspiration?</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p className="italic">
              "Jake's the guy who'll help you move without being asked, explains code without making you feel dumb, and gets genuinely excited about your wins."
            </p>
            <p className="italic">
              "Emma turns every mundane moment into an adventure. Grocery shopping becomes a quest, traffic jams become karaoke sessions."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}