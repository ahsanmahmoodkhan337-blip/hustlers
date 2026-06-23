import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database with Direct Access Requests and Scenarios...')

  // Seed Access Requests
  const requests = [
    {
      studentName: 'Muhammad Bilal',
      studentPhone: '03105265337',
      studentEmail: 'bilal@example.com',
      paymentMethod: 'EasyPaisa',
      transactionId: 'TXN-EP-9988',
      isApproved: true,
    },
    {
      studentName: 'Ayesha Fatima',
      studentPhone: '03219876543',
      studentEmail: 'ayesha@example.com',
      isApproved: true,
      paymentMethod: 'Bank Islami',
      transactionId: 'TXN-BI-4455',
    },
    {
      studentName: 'Zainab Ahmed',
      studentPhone: '03001122334',
      studentEmail: 'zainab@example.com',
      isApproved: false,
      paymentMethod: 'PayPal',
      transactionId: 'TXN-PP-1122',
    }
  ]

  for (const req of requests) {
    const existing = await prisma.accessRequest.findUnique({
      where: { studentPhone: req.studentPhone }
    })
    if (!existing) {
      await prisma.accessRequest.create({
        data: req
      })
    }
  }
  console.log('Access requests seeded successfully.')

  // Seed Scenarios
  const scenarios = [
    {
      title: 'Cardiology Clinic - Chest Pain Follow-up',
      description: 'A 58-year-old male with history of coronary artery disease presents for follow-up of atypical chest pain.',
      audioUrl: '/audio/cardiology_followup.mp3',
      transcript: 'The patient is a 58-year-old male who presents today for follow-up of coronary artery disease and recent episodes of atypical chest pain. He states that the chest pain is sharp, fleeting, and does not seem to be associated with exertion. His blood pressure is well-controlled on Lisinopril, and he reports no shortness of breath, palpitations, or lightheadedness. On physical exam, his lungs are clear to auscultation bilaterally, and his heart rate is regular with no murmurs, rubs, or gallops. Electrocardiogram performed in the office shows normal sinus rhythm with no acute ST-T changes. We will proceed with a treadmill stress test to rule out any inducible ischemia and continue his current medication regimen.',
      difficulty: 'Medium',
    },
    {
      title: 'Emergency Department - Acute Appendicitis',
      description: 'Emergency room dictation for a pediatric patient with right lower quadrant abdominal pain.',
      audioUrl: '/audio/ed_appendicitis.mp3',
      transcript: 'This is a 12-year-old female who presents to the emergency department with a 24-hour history of progressive abdominal pain, which started in the periumbilical region and has now localized to the right lower quadrant. The pain is associated with loss of appetite, nausea, and two episodes of non-bilious vomiting. On physical examination, the patient is febrile with a temperature of 101.2 degrees Fahrenheit. Abdominal exam is notable for moderate to severe tenderness in the right lower quadrant with positive rebound and guarding at McBurney\'s point. Laboratory evaluation is significant for leukocytosis with a white blood cell count of 14,000. An ultrasound of the appendix has been ordered to confirm the diagnosis of acute appendicitis.',
      difficulty: 'Hard',
    },
    {
      title: 'Pediatric Wellness Visit',
      description: 'Routine check-up for a healthy 4-year-old child.',
      audioUrl: '/audio/pediatric_checkup.mp3',
      transcript: 'The patient is a 4-year-old male who presents today with his mother for a well-child checkup. The mother reports that the child is active, eating well, and meeting all developmental milestones. On physical examination, the child is well-nourished and in no acute distress. Immunizations are up to date, and growth charts show both height and weight are tracking along the 65th percentile.',
      difficulty: 'Easy'
    }
  ]

  for (const scenario of scenarios) {
    const existing = await prisma.scenario.findFirst({
      where: { title: scenario.title }
    });
    if (!existing) {
      await prisma.scenario.create({
        data: scenario
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
