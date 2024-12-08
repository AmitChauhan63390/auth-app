import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received signup request:', body)

    const { firstName, lastName, email, countryCode, phoneNumber, password, dateOfBirth, gender } = body

    // Server-side validation
    if (!firstName || !lastName || !email || !countryCode || !phoneNumber || !password || !dateOfBirth || !gender) {
      console.log('Validation failed: Missing required fields')
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      console.log('Validation failed: Invalid email')
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 })
    }

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      console.log('Validation failed: Invalid phone number')
      return NextResponse.json({ message: 'Invalid phone number' }, { status: 400 })
    }

    if (password.length < 8) {
      console.log('Validation failed: Password too short')
      return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 })
    }

    console.log('Validation passed, hashing password')
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log('Creating user in database')
    try {
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          countryCode,
          phoneNumber,
          password: hashedPassword,
          dateOfBirth: new Date(dateOfBirth),
          gender,
        },
      })

      console.log('User created successfully:', user.id)
      return NextResponse.json({ message: 'User created successfully', userId: user.id }, { status: 201 })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        message: 'Error creating user in database', 
        error: dbError instanceof Error ? dbError.message : 'Unknown database error' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ 
      message: 'Error processing signup request', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

