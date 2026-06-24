import { prisma } from './src/lib/db';

async function test() {
  console.log('Testing Revoke Scribe logic...');
  
  // Create a dummy request
  const dummy = await prisma.accessRequest.create({
    data: {
      studentName: 'Test Student',
      studentPhone: '9999999999',
      studentEmail: 'test@example.com',
      paymentMethod: 'Test',
      transactionId: 'TEST-TXN-' + Date.now(),
      isApproved: true,
    }
  });
  
  console.log('Created dummy request:', dummy.id);
  
  // Create a dummy stat
  const stat = await prisma.userTypingStat.create({
    data: {
      accessRequestId: dummy.id,
      caseName: 'Test Case',
      wpm: 50,
      accuracy: 100,
      passed: true,
    }
  });
  
  console.log('Created dummy stat:', stat.id);
  
  // Try to delete the request
  try {
    await prisma.accessRequest.delete({
      where: { id: dummy.id }
    });
    console.log('Successfully deleted request and its stats (CASCADE working).');
  } catch (error) {
    console.error('Failed to delete request:', error);
  }
}

test();
