// app/account/delete/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'  // FIXED
import { createAdminClient } from '@/lib/supabase/admin'    // FIXED

export async function POST() {
  try {
    const supabase = createServerClient()
    const admin = createAdminClient()

    // Get the currently logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all user-related data (optional)
    await admin.from('hype_requests').delete().eq('requester_id', user.id)
    await admin.from('hypes').delete().eq('to_user_id', user.id)

    // Delete the user from auth
    const { error } = await admin.auth.admin.deleteUser(user.id)

    if (error) {
      console.error('Delete user error:', error)
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}