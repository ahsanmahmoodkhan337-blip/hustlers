'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Define action result types
export type ActionResponse<T = unknown> = {
  success: boolean
  message: string
  data?: T
  pending?: boolean
}

// 1. Submit a brand-new Access Request
export async function submitAccessRequest(data: {
  studentName: string
  studentPhone: string
  studentEmail: string
  paymentMethod: string
  transactionId: string
}): Promise<ActionResponse> {
  try {
    const { studentName, studentPhone, studentEmail, paymentMethod, transactionId } = data

    if (!studentName || !studentPhone || !studentEmail || !paymentMethod || !transactionId) {
      return { success: false, message: 'All 5 fields are required to submit an access request.' }
    }

    // Check if phone number already exists
    const existingPhone = await prisma.accessRequest.findUnique({
      where: { studentPhone },
    })

    if (existingPhone) {
      return {
        success: false,
        message: 'An access request with this Phone Number already exists. If it is approved, please log in below. If pending, please wait.',
      }
    }

    // Check if transaction ID already exists
    const existingTxn = await prisma.accessRequest.findUnique({
      where: { transactionId },
    })

    if (existingTxn) {
      return {
        success: false,
        message: 'This Transaction ID has already been submitted. If you made a mistake, please use a unique transaction ID.',
      }
    }

    // Create the pending AccessRequest
    await prisma.accessRequest.create({
      data: {
        studentName,
        studentPhone,
        studentEmail,
        paymentMethod,
        transactionId,
        isApproved: false, // Default is false (pending approval)
      },
    })

    revalidatePath('/')
    return {
      success: true,
      message: 'Access request submitted successfully! An administrator will review and approve your payment details within 1-2 hours.',
    }
  } catch (error) {
    console.error('Error submitting access request:', error)
    return { success: false, message: 'Internal server error while processing your request. Please try again.' }
  }
}

// 2. Student Login verification
export async function studentLogin(studentPhone: string): Promise<ActionResponse<{ id: string; name: string; phone: string }>> {
  try {
    if (!studentPhone) {
      return { success: false, message: 'Phone Number is required.' }
    }

    const request = await prisma.accessRequest.findUnique({
      where: { studentPhone },
    })

    if (!request) {
      return {
        success: false,
        message: 'No access request found for this Phone Number. Please submit an access request first using the form above.',
      }
    }

    if (!request.isApproved) {
      return {
        success: false,
        pending: true,
        message: 'Your access request is currently PENDING verification. Our admins verify all payments manually. Please check back in a few minutes or contact support.',
      }
    }

    return {
      success: true,
      message: 'Logged in successfully!',
      data: {
        id: request.id,
        name: request.studentName,
        phone: request.studentPhone,
      },
    }
  } catch (error) {
    console.error('Error on student login:', error)
    return { success: false, message: 'Internal server error on login.' }
  }
}

// 3. Submit typing stat for approved student
export async function submitTypingStat(data: {
  accessRequestId: string
  caseName: string
  wpm: number
  accuracy: number
  passed: boolean
}): Promise<ActionResponse> {
  try {
    const { accessRequestId, caseName, wpm, accuracy, passed } = data

    if (!accessRequestId || !caseName || wpm === undefined || accuracy === undefined || passed === undefined) {
      return { success: false, message: 'Invalid stats data.' }
    }

    await prisma.userTypingStat.create({
      data: {
        accessRequestId,
        caseName,
        wpm,
        accuracy,
        passed,
      },
    })

    revalidatePath('/')
    return { success: true, message: 'Stats saved successfully!' }
  } catch (error) {
    console.error('Error saving typing stat:', error)
    return { success: false, message: 'Internal server error while saving stat.' }
  }
}

// 4. Fetch scenarios for the practice center
export async function getScenarios() {
  try {
    return await prisma.scenario.findMany({
      orderBy: { title: 'asc' },
    })
  } catch (error) {
    console.error('Error fetching scenarios:', error)
    return []
  }
}

// 5. Fetch student history stats
export async function getStudentStats(accessRequestId: string) {
  try {
    return await prisma.userTypingStat.findMany({
      where: { accessRequestId },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Error fetching student stats:', error)
    return []
  }
}

// 6. Admin: Get all requests (pending first)
export async function adminGetRequests() {
  try {
    const list = await prisma.accessRequest.findMany({
      include: {
        stats: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    // Explicitly serialize Date fields to avoid Client-side / Server-action transition serialization crashes
    return list.map(req => ({
      ...req,
      createdAt: req.createdAt.toISOString(),
      stats: req.stats.map(s => ({
        ...s,
        createdAt: s.createdAt.toISOString()
      }))
    }))
  } catch (error) {
    console.error('Error fetching admin requests:', error)
    return []
  }
}

// 7. Admin: Approve Request
export async function adminApproveRequest(id: string): Promise<ActionResponse> {
  try {
    await prisma.accessRequest.update({
      where: { id },
      data: { isApproved: true },
    })
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true, message: 'Request approved successfully!' }
  } catch (error) {
    console.error('Error approving request:', error)
    return { success: false, message: 'Error approving request.' }
  }
}

// 8. Admin: Deny/Delete Request
export async function adminDenyRequest(id: string): Promise<ActionResponse> {
  try {
    await prisma.accessRequest.delete({
      where: { id },
    })
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true, message: 'Request denied and removed successfully.' }
  } catch (error) {
    console.error('Error denying request:', error)
    return { success: false, message: 'Error deleting/denying request.' }
  }
}
