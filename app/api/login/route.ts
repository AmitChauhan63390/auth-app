import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Server-side validation
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'jwt_secret',
      { expiresIn: '1h' }
    )

    return NextResponse.json({ token })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Error logging in' }, { status: 500 })
  }
}

