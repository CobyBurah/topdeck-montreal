import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Update status to cancelled (soft delete approach)
  const { error } = await supabase
    .from('scheduled_messages')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('status', 'pending')

  if (error) {
    console.error('Failed to cancel scheduled message:', error)
    return NextResponse.json({ error: 'Failed to cancel scheduled message' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
