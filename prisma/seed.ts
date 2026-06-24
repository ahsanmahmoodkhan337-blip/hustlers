import { prisma } from '../src/lib/db'

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
    },
    {
      title: 'Neurology - Migraine Management',
      description: 'A 34-year-old female with a long history of chronic migraines presents for a medication review.',
      audioUrl: '/audio/neurology_migraine.mp3',
      transcript: 'The patient is a 34-year-old female with a long-standing history of chronic migraines, presenting today for a follow-up and medication review. She reports that her headache frequency has increased to approximately three times per week over the last month. The headaches are typically unilateral, throbbing in nature, and accompanied by photophobia and phonophobia. She has been using Sumatriptan as an abortive therapy with moderate success but is requesting a more effective prophylactic regimen. We discussed starting Topiramate at a low dose and gradually titrating up. She was advised on potential side effects and the importance of maintaining a headache diary. We will re-evaluate her progress in six weeks.',
      difficulty: 'Medium'
    },
    {
      title: 'Orthopedic Surgery - Knee Osteoarthritis',
      description: 'Consultation for a 62-year-old patient with persistent bilateral knee pain.',
      audioUrl: '/audio/ortho_knee.mp3',
      transcript: 'The patient is a 62-year-old male presenting with a two-year history of worsening bilateral knee pain, right greater than left. He describes the pain as a dull ache that is aggravated by prolonged standing and climbing stairs. He has tried conservative management including physical therapy and over-the-counter anti-inflammatories without significant relief. Physical examination reveals crepitus and limited range of motion in both knees. Radiographs demonstrate significant joint space narrowing and osteophyte formation consistent with Grade 3 osteoarthritis. We discussed the options of intra-articular corticosteroid injections versus proceeding with a total knee arthroplasty. The patient has elected to start with a trial of injections today.',
      difficulty: 'Easy'
    },
    {
      title: 'Gastroenterology - GERD Follow-up',
      description: 'Follow-up for a patient with chronic gastroesophageal reflux disease.',
      audioUrl: '/audio/gi_gerd.mp3',
      transcript: 'This 45-year-old male returns for follow-up of gastroesophageal reflux disease. He has been taking Omeprazole 20 mg daily with good control of his symptoms, including heartburn and regurgitation. He denies any dysphagia, weight loss, or change in bowel habits. His last upper endoscopy, performed one year ago, showed mild esophagitis but was negative for Barrett’s esophagus. We will continue his current dose of Omeprazole and encouraged him to follow dietary modifications, such as avoiding spicy foods and not eating late at night. He is scheduled for a follow-up endoscopy in two years.',
      difficulty: 'Medium'
    },
    {
      title: 'Dermatology - Eczema Evaluation',
      description: 'A young adult with a flare-up of atopic dermatitis.',
      audioUrl: '/audio/derm_eczema.mp3',
      transcript: 'The patient is a 19-year-old male presenting with a flare-up of atopic dermatitis involving the flexural surfaces of his elbows and knees. He reports significant pruritus that interferes with his sleep. On examination, there are erythematous, excoriated plaques in the classic distribution. There is no evidence of secondary bacterial infection. We will prescribe a medium-potency topical corticosteroid for the active lesions and emphasized the importance of regular use of emollients and gentle skin care. He was also advised to avoid known triggers and to return if there is no improvement within two weeks.',
      difficulty: 'Easy'
    },
    {
      title: 'Psychiatry - Anxiety Consultation',
      description: 'Initial evaluation for generalized anxiety disorder.',
      audioUrl: '/audio/psych_anxiety.mp3',
      transcript: 'This 28-year-old female presents for an initial psychiatric evaluation due to persistent feelings of worry and tension that have been present for the past eight months. She describes difficulty concentrating, muscle tension, and sleep disturbance. These symptoms are causing significant distress and impairment in her occupational functioning. She denies any history of panic attacks or obsessive-compulsive behaviors. After a thorough clinical interview and review of symptoms, she meets the criteria for generalized anxiety disorder. We discussed a treatment plan involving both cognitive-behavioral therapy and the initiation of a selective serotonin reuptake inhibitor, specifically Sertraline. The patient is agreeable to this combined approach and will follow up in three weeks to monitor for response and side effects.',
      difficulty: 'Hard'
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
