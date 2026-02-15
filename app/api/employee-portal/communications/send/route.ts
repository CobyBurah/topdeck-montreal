import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SendMessageRequest {
  customer_id: string
  type: 'email' | 'sms'
  subject?: string
  message: string
  reply_to_id?: string
  scheduled_time?: string
  signature?: string
}

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse request body
  const body: SendMessageRequest = await request.json()
  const { customer_id, type, subject, message, reply_to_id, scheduled_time, signature } = body

  // Validate required fields
  if (!customer_id) {
    return NextResponse.json({ error: 'customer_id is required' }, { status: 400 })
  }
  if (!type || !['email', 'sms'].includes(type)) {
    return NextResponse.json({ error: 'type must be "email" or "sms"' }, { status: 400 })
  }
  if (type === 'email' && !subject?.trim()) {
    return NextResponse.json({ error: 'subject is required for email' }, { status: 400 })
  }
  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  // Fetch customer to get contact info
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, full_name, email, phone, language')
    .eq('id', customer_id)
    .single()

  if (customerError || !customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  // Validate customer has required contact info
  if (type === 'email' && !customer.email) {
    return NextResponse.json({ error: 'Customer does not have an email address' }, { status: 400 })
  }
  if (type === 'sms' && !customer.phone) {
    return NextResponse.json({ error: 'Customer does not have a phone number' }, { status: 400 })
  }

  // Validate scheduled_time if provided
  if (scheduled_time) {
    const scheduledDate = new Date(scheduled_time)
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduled_time format' }, { status: 400 })
    }
    if (scheduledDate <= new Date()) {
      return NextResponse.json({ error: 'scheduled_time must be in the future' }, { status: 400 })
    }

    // Insert into scheduled_messages table
    const { error: scheduleError } = await supabase
      .from('scheduled_messages')
      .insert({
        customer_id: customer.id,
        type,
        subject: type === 'email' ? subject : null,
        message,
        scheduled_for: scheduled_time,
        reply_to_id: reply_to_id || null,
        signature: type === 'email' ? (signature || 'none') : null,
      })

    if (scheduleError) {
      console.error('Failed to create scheduled message record:', scheduleError)
      return NextResponse.json({ error: 'Failed to schedule message' }, { status: 500 })
    }
  }

  // Send webhook to n8n - n8n will handle the actual delivery and database insert
  const webhookUrl = process.env.N8N_SEND_MESSAGE_WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Messaging service not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        customer_id: customer.id,
        customer_name: customer.full_name,
        to: type === 'email' ? customer.email : customer.phone,
        subject: type === 'email' ? subject : undefined,
        message,
        language: customer.language || 'en',
        reply_to_id,
        scheduled_time: scheduled_time || null,
        signature: type === 'email' ? (signature || 'none') : undefined,
      }),
    })

    if (!response.ok) {
      console.error('n8n webhook failed:', response.status, response.statusText)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('n8n webhook error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
