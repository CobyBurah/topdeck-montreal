import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const service = formData.get('service') as string
    const size = formData.get('size') as string
    const timeline = formData.get('timeline') as string
    const message = formData.get('message') as string

    // Log the submission for now
    console.log('New quote request:', {
      name,
      email,
      phone,
      address,
      service,
      size,
      timeline,
      message,
    })

    // TODO: Add email sending functionality later

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
