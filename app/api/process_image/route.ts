import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://backendpneu-env.eba-9mp795ix.eu-north-1.elasticbeanstalk.com'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    if (!BACKEND_URL) {
      throw new Error('Backend API URL is not configured.')
    }

    const backendResponse = await fetch(`${BACKEND_URL}/process_image`, {
      method: 'POST',
      body: formData,
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      return new NextResponse(errorText, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
      })
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in API proxy route:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}


