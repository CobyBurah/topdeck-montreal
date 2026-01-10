import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Get all uploaded images
    const images = formData.getAll('images') as File[]
    const attachments = await Promise.all(
      images
        .filter(file => file.size > 0)
        .map(async (file) => {
          const buffer = await file.arrayBuffer()
          return {
            filename: file.name,
            content: Buffer.from(buffer),
          }
        })
    )

    const emailHtml = `
      <h2>New Quote Request from Top Deck Montreal Website</h2>

      <h3>Contact Information</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      ${address ? `<p><strong>Address:</strong> ${address}</p>` : ''}

      <h3>Project Details</h3>
      <p><strong>Service Needed:</strong> ${service}</p>
      ${size ? `<p><strong>Size/Scope:</strong> ${size}</p>` : ''}
      ${timeline ? `<p><strong>Timeline:</strong> ${timeline}</p>` : ''}

      ${message ? `<h3>Additional Details</h3><p>${message}</p>` : ''}

      ${attachments.length > 0 ? `<p><strong>Attached Images:</strong> ${attachments.length} file(s)</p>` : ''}
    `

    const { data, error } = await resend.emails.send({
      from: 'Top Deck Montreal <noreply@topdeckmontreal.com>',
      to: ['info@topdeckmontreal.com'],
      replyTo: email,
      subject: `New Quote Request from ${name}`,
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
