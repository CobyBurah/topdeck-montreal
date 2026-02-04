import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SendMessageRequest {
  customer_id: string
  type: 'email' | 'sms'
  subject?: string
  message: string
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
  const { customer_id, type, subject, message } = body

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

  const now = new Date().toISOString()
  let logId: string

  try {
    if (type === 'email') {
      // Insert email log
      const { data: emailLog, error: emailError } = await supabase
        .from('email_logs')
        .insert({
          customer_id,
          direction: 'outbound',
          subject,
          body: message,
          status: 'sent',
          sent_at: now,
        })
        .select('id')
        .single()

      if (emailError) {
        console.error('Error inserting email log:', emailError)
        return NextResponse.json({ error: 'Failed to log email' }, { status: 500 })
      }

      logId = emailLog.id
    } else {
      // Insert SMS log
      const { data: smsLog, error: smsError } = await supabase
        .from('sms_logs')
        .insert({
          customer_id,
          direction: 'outbound',
          message,
          sent_at: now,
        })
        .select('id')
        .single()

      if (smsError) {
        console.error('Error inserting SMS log:', smsError)
        return NextResponse.json({ error: 'Failed to log SMS' }, { status: 500 })
      }

      logId = smsLog.id
    }

    // Send webhook to n8n for actual delivery
    const webhookUrl = process.env.N8N_SEND_MESSAGE_WEBHOOK_URL
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            log_id: logId,
            customer_id: customer.id,
            customer_name: customer.full_name,
            to: type === 'email' ? customer.email : customer.phone,
            subject: type === 'email' ? subject : undefined,
            message,
            language: customer.language || 'en',
          }),
        })
      } catch (webhookError) {
        // Log but don't fail the request if webhook fails
        console.error('n8n webhook error:', webhookError)
      }
    }

    return NextResponse.json({ success: true, id: logId })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
