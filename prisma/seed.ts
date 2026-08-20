import 'dotenv/config'
import { prisma } from '../src/lib/db'

async function main() {
  console.log('Seeding database with SOAP-structured Scenarios...')

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
    await prisma.accessRequest.upsert({
      where: { studentPhone: req.studentPhone },
      update: req,
      create: req,
    })
  }
  console.log('Access requests seeded successfully.')

  // Seed Scenarios with SOAP format
  const scenarios = [
    {
      title: 'Cardiology Clinic - Chest Pain Follow-up',
      description: 'A 58-year-old male with history of coronary artery disease presents for follow-up of atypical chest pain.',
      audioUrl: '/audio/cardiology_followup_v3.mp3',
      transcript: `[SUBJECTIVE]: The patient is a 58-year-old male who presents today for follow-up of coronary artery disease and recent episodes of atypical chest pain. He states that the chest pain is sharp, fleeting, and does not seem to be associated with exertion or diaphoresis. He denies any radiation to the left arm or jaw. He has been adherent to his medication regimen, which includes Lisinopril and Atorvastatin. He reports no shortness of breath, palpitations, or lightheadedness. 
[OBJECTIVE]: Blood pressure is 128/78, heart rate is 72 beats per minute, and oxygen saturation is 98% on room air. On physical exam, the patient is in no acute distress. Lungs are clear to auscultation bilaterally. Heart rate is regular with no murmurs, rubs, or gallops. No peripheral edema noted. Electrocardiogram performed in the office shows normal sinus rhythm with no acute ST-segment or T-wave changes.
[ASSESSMENT]: Stable coronary artery disease with atypical chest pain, likely musculoskeletal or gastrointestinal in origin, though inducible ischemia cannot be entirely ruled out based on symptoms alone.
[PLAN]: We will proceed with a treadmill stress test to rule out any inducible ischemia. The patient was instructed to continue his current medication regimen and to present to the emergency department if his chest pain becomes crushing, prolonged, or associated with shortness of breath.`,
      difficulty: 'Medium',
    },
    {
      title: 'Emergency Department - Acute Appendicitis',
      description: 'Emergency room dictation for a pediatric patient with right lower quadrant abdominal pain.',
      audioUrl: '/audio/ed_appendicitis_v3.mp3',
      transcript: `[SUBJECTIVE]: This is a 12-year-old female who presents to the emergency department with a 24-hour history of progressive abdominal pain. The pain initially started in the periumbilical region and has since localized to the right lower quadrant. The mother reports the patient has a loss of appetite, nausea, and has had two episodes of non-bilious vomiting. No history of urinary symptoms or change in bowel habits.
[OBJECTIVE]: Temperature is 101.2 degrees Fahrenheit, heart rate is 110, and blood pressure is 105/65. On physical examination, the patient appears ill and is lying still on the gurney. Abdominal exam is notable for moderate to severe tenderness in the right lower quadrant. There is positive rebound tenderness and guarding at McBurney's point. Rovsing's sign is also positive.
[ASSESSMENT]: Acute appendicitis.
[PLAN]: The patient will be kept NPO. We have ordered intravenous fluids and analgesia. Laboratory evaluation shows leukocytosis with a white blood cell count of 14,000. An ultrasound of the appendix is pending to confirm the diagnosis. We have consulted the pediatric surgery team for evaluation and potential appendectomy.`,
      difficulty: 'Hard',
    },
    {
      title: 'Pediatric Wellness Visit',
      description: 'Routine check-up for a healthy 4-year-old child.',
      audioUrl: '/audio/pediatric_checkup_v3.mp3',
      transcript: `[SUBJECTIVE]: The patient is a 4-year-old male who presents today with his mother for a routine well-child checkup. The mother reports that the child is active, eating a balanced diet, and meeting all developmental milestones. He has started preschool and is interacting well with peers. There are no concerns regarding his hearing, vision, or sleep patterns.
[OBJECTIVE]: Height and weight are tracking along the 65th percentile. Vital signs are normal for his age. On physical examination, the child is well-nourished, cooperative, and in no acute distress. Neurological exam shows age-appropriate gross and fine motor skills. Cardiovascular and respiratory exams are unremarkable.
[ASSESSMENT]: Healthy 4-year-old male, meeting all developmental milestones.
[PLAN]: Immunizations were reviewed and are up to date. We discussed the importance of continued healthy eating, daily physical activity, and limit on screen time. The next well-child visit is scheduled for one year.`,
      difficulty: 'Easy'
    },
    {
      title: 'Neurology - Migraine Management',
      description: 'A 34-year-old female with a long history of chronic migraines presents for a medication review.',
      audioUrl: '/audio/neurology_migraine_v3.mp3',
      transcript: `[SUBJECTIVE]: The patient is a 34-year-old female with a long-standing history of chronic migraines. She presents today for a follow-up and medication review. She reports that her headache frequency has increased to approximately three times per week over the last month. The headaches are unilateral, throbbing, and associated with photophobia, phonophobia, and occasional nausea. She has been using Sumatriptan as an abortive therapy but feels it is no longer sufficient.
[OBJECTIVE]: Vital signs are stable. Neurological examination, including cranial nerves, motor, and sensory testing, is completely normal. There is no evidence of papilledema on funduscopic exam.
[ASSESSMENT]: Chronic migraines with increased frequency, requiring transition from abortive-only therapy to a prophylactic regimen.
[PLAN]: We discussed starting Topiramate at 25 mg daily, titrating up slowly to 50 mg twice daily as tolerated. The patient was advised on potential side effects, including paresthesia and cognitive dampening. She will maintain a headache diary to track frequency and triggers. We will re-evaluate her progress in six weeks.`,
      difficulty: 'Medium'
    },
    {
      title: 'Orthopedic Surgery - Knee Osteoarthritis',
      description: 'Consultation for a 62-year-old patient with persistent bilateral knee pain.',
      audioUrl: '/audio/ortho_knee_v3.mp3',
      transcript: `[SUBJECTIVE]: The patient is a 62-year-old male presenting with a two-year history of worsening bilateral knee pain, right greater than left. He describes the pain as a dull ache that is aggravated by prolonged standing, walking on hard surfaces, and climbing stairs. He has tried physical therapy and over-the-counter anti-inflammatories with only temporary relief. He denies any recent trauma or locking of the joints.
[OBJECTIVE]: Physical examination reveals crepitus and limited range of motion in both knees, particularly on the right side. There is mild joint line tenderness but no significant effusion. Radiographs demonstrate significant joint space narrowing and osteophyte formation in the medial compartments.
[ASSESSMENT]: Grade 3 bilateral knee osteoarthritis.
[PLAN]: We discussed the options of intra-articular corticosteroid injections versus proceeding with a total knee arthroplasty. The patient is not ready for surgery and has elected to start with a trial of injections today. He was also encouraged to continue low-impact exercise and weight management.`,
      difficulty: 'Easy'
    },
    {
      title: 'Gastroenterology - GERD Follow-up',
      description: 'Follow-up for a patient with chronic gastroesophageal reflux disease.',
      audioUrl: '/audio/gi_gerd_v3.mp3',
      transcript: `[SUBJECTIVE]: This 45-year-old male returns for follow-up of gastroesophageal reflux disease. He has been taking Omeprazole 20 mg daily with good control of his symptoms, including heartburn and acid regurgitation. He denies any dysphagia, weight loss, or change in bowel habits. He reports he has been trying to follow dietary modifications but find it difficult during work travel.
[OBJECTIVE]: On examination, the abdomen is soft, non-tender, and non-distended. No masses or organomegaly noted. Bowel sounds are normal in all four quadrants.
[ASSESSMENT]: Stable GERD on proton pump inhibitor therapy.
[PLAN]: We will continue his current dose of Omeprazole. We re-emphasized the importance of avoiding late-night meals and spicy or fatty foods. His last upper endoscopy was negative for Barrett’s esophagus; we will schedule a follow-up endoscopy in two years to monitor for any mucosal changes.`,
      difficulty: 'Medium'
    },
    {
      title: 'Dermatology - Eczema Evaluation',
      description: 'A young adult with a flare-up of atopic dermatitis.',
      audioUrl: '/audio/derm_eczema_v3.mp3',
      transcript: `[SUBJECTIVE]: The patient is a 19-year-old male presenting with a flare-up of atopic dermatitis. He reports significant pruritus involving the flexural surfaces of his elbows and knees, which has been present for the last two weeks. The itching is worse at night and interferes with his sleep. He has been using over-the-counter lotions without improvement.
[OBJECTIVE]: On examination, there are erythematous, excoriated, and lichenified plaques in the antecubital and popliteal fossae. There is no evidence of honey-colored crusting or secondary bacterial infection. The remainder of the skin is dry but clear.
[ASSESSMENT]: Acute flare of atopic dermatitis (eczema).
[PLAN]: We will prescribe Triamcinolone 0.1% cream to be applied to the active lesions twice daily for two weeks. He was advised on the importance of regular use of thick emollients and to avoid harsh soaps or hot showers. We will follow up in three weeks if the symptoms do not resolve.`,
      difficulty: 'Easy'
    },
    {
      title: 'Psychiatry - Anxiety Consultation',
      description: 'Initial evaluation for generalized anxiety disorder.',
      audioUrl: '/audio/psych_anxiety_v3.mp3',
      transcript: `[SUBJECTIVE]: This 28-year-old female presents for an initial psychiatric evaluation due to persistent feelings of worry and tension present for the past eight months. She describes difficulty concentrating, muscle tension, and significant sleep disturbance. These symptoms are causing distress and impairment in her performance at work. She denies any history of panic attacks, obsessive thoughts, or suicidal ideation.
[OBJECTIVE]: On mental status examination, the patient is alert and oriented. Her speech is at a normal rate and volume. Her mood is described as "anxious" with a congruent, constricted affect. Her thought process is linear and goal-directed. Insight and judgment are fair.
[ASSESSMENT]: Generalized Anxiety Disorder (GAD).
[PLAN]: We discussed a treatment plan involving both cognitive-behavioral therapy and the initiation of a selective serotonin reuptake inhibitor. We will start Sertraline 25 mg daily for one week, then increase to 50 mg. The patient is agreeable to this approach and will follow up in three weeks to monitor for therapeutic response and potential side effects.`,
      difficulty: 'Hard'
    },
    {
      title: 'Pulmonology - COPD Exacerbation',
      description: 'An elderly smoker presents with worsening dyspnea and a change in sputum production.',
      audioUrl: '/audio/pulm_copd_v3.mp3',
      transcript: `[SUBJECTIVE]: The patient is a 68-year-old male with a 40-pack-year smoking history who presents with a three-day history of worsening dyspnea and increased sputum production. He reports his baseline breathlessness has progressed to shortness of breath even at rest. His sputum has changed from clear to yellow-green and has increased in volume. He denies fever, hemoptysis, or chest pain, but notes increased use of his rescue inhaler without relief.
[OBJECTIVE]: The patient is in moderate respiratory distress, speaking in short phrases. Respiratory rate is 26, oxygen saturation is 88 percent on room air, and heart rate is 104. Lung examination reveals diffuse expiratory wheezes bilaterally with a prolonged expiratory phase and decreased breath sounds at the bases. There is mild accessory muscle use. No cyanosis or peripheral edema noted.
[ASSESSMENT]: Acute exacerbation of chronic obstructive pulmonary disease with hypoxemia and a likely infectious trigger.
[PLAN]: The patient will be admitted for oxygen therapy, nebulized bronchodilators, and systemic corticosteroids. A chest radiograph and sputum culture have been ordered. We will initiate empiric antibiotics and continue his long-acting bronchodilators. Smoking cessation counseling will be reinforced prior to discharge.`,
      difficulty: 'Hard'
    },
    {
      title: 'Endocrinology - Diabetes Type 2 Follow-up',
      description: 'Routine diabetes follow-up with hemoglobin A1c review and medication adjustment.',
      audioUrl: '/audio/endo_diabetes_v3.mp3',
      transcript: `[SUBJECTIVE]: The patient is a 54-year-old male with type 2 diabetes mellitus who presents for routine follow-up. He reports adherence to his Metformin but admits to frequent snacking and limited physical activity. He denies polyuria, polydipsia, or blurry vision. He reports occasional numbness in his feet but no ulcerations or infections.
[OBJECTIVE]: Blood pressure is 138 over 86. Weight is stable. Recent laboratory studies reveal a hemoglobin A1c of 8.4 percent, up from 7.6 percent three months ago. Fasting glucose is 168 milligrams per deciliter. Monofilament examination reveals mildly reduced sensation in both feet.
[ASSESSMENT]: Type 2 diabetes mellitus with suboptimal glycemic control and early peripheral neuropathy.
[PLAN]: We will titrate Metformin to 1000 milligrams twice daily and add a GLP-1 receptor agonist. The patient was referred for diabetic foot care and nutritional counseling. We will recheck hemoglobin A1c in three months and monitor renal function.`,
      difficulty: 'Medium'
    },
    {
      title: 'Rheumatology - Rheumatoid Arthritis',
      description: 'A patient with symmetric joint pain and morning stiffness undergoes a DMARD review.',
      audioUrl: '/audio/rheum_ra_v3.mp3',
      transcript: `[SUBJECTIVE]: The patient is a 47-year-old female with rheumatoid arthritis who presents for medication review. She reports persistent pain and swelling in the small joints of both hands and wrists, with morning stiffness lasting over an hour. She has been on Methotrexate for six months but feels her symptoms are only partially controlled. She denies fever, rash, or other systemic symptoms.
[OBJECTIVE]: Examination reveals symmetric swelling and tenderness of the metacarpophalangeal and proximal interphalangeal joints. There is mild ulnar deviation but no nodules or deformities. Range of motion is limited by pain. Inflammatory markers are elevated with an erythrocyte sedimentation rate of 42 and C-reactive protein of 18.
[ASSESSMENT]: Moderately active rheumatoid arthritis despite Methotrexate monotherapy.
[PLAN]: We will continue Methotrexate and add a TNF inhibitor. Baseline screening for tuberculosis and hepatitis was ordered prior to initiating biologic therapy. The patient will follow up in eight weeks to assess treatment response and monitor for adverse effects.`,
      difficulty: 'Medium'
    },
    {
      title: 'ENT - Chronic Sinusitis',
      description: 'A patient with recurrent sinus infections and persistent facial pressure.',
      audioUrl: '/audio/ent_sinusitis_v3.mp3',
      transcript: `[SUBJECTIVE]: The patient is a 33-year-old female presenting with a six-month history of nasal congestion, facial pressure, and postnasal drip. She reports recurrent sinus infections that have required multiple courses of antibiotics. Symptoms are worse in the morning and when she lies down. She denies fever, epistaxis, or severe headaches.
[OBJECTIVE]: Anterior rhinoscopy reveals edematous nasal mucosa with mucopurulent discharge. There is tenderness over the maxillary sinuses bilaterally. No nasal polyps or masses are visualized. The remainder of the head and neck exam is unremarkable.
[ASSESSMENT]: Chronic rhinosinusitis with recurrent acute exacerbations.
[PLAN]: We will initiate a course of intranasal corticosteroids with daily saline irrigation. A CT scan of the sinuses has been ordered to evaluate for anatomic obstruction. If medical therapy fails, the patient will be referred for consideration of functional endoscopic sinus surgery.`,
      difficulty: 'Easy'
    },
    {
      title: 'Urology - BPH Evaluation',
      description: 'An older male presents with urinary frequency and a weak stream.',
      audioUrl: '/audio/uro_bph_v3.mp3',
      transcript: `[SUBJECTIVE]: The patient is a 64-year-old male presenting with a one-year history of progressive urinary symptoms. He reports urinary frequency, nocturia, and hesitancy with a weak urinary stream. He denies dysuria, hematuria, or fever. Symptoms have begun to interfere with his sleep and daily activities.
[OBJECTIVE]: Digital rectal examination reveals an enlarged, smooth, symmetric prostate without nodules or induration. Urinalysis is negative for infection or blood. Post-void residual volume measured by bladder ultrasound is 90 milliliters.
[ASSESSMENT]: Benign prostatic hyperplasia with moderate lower urinary tract symptoms.
[PLAN]: We will initiate therapy with an alpha blocker to relax the prostate and bladder neck. The patient was counseled on limiting evening fluid intake and avoiding caffeine. We will reassess symptom response in six weeks and consider a 5-alpha-reductase inhibitor if symptoms persist.`,
      difficulty: 'Easy'
    },
    {
      title: 'Ophthalmology - Cataract Assessment',
      description: 'Gradual vision loss and glare in a patient referred for cataract evaluation.',
      audioUrl: '/audio/ophtho_cataract_v3.mp3',
      transcript: `[SUBJECTIVE]: The patient is a 71-year-old female who presents with a one-year history of gradual, painless vision loss in both eyes. She reports difficulty with night driving due to glare and halos around lights. Reading has become increasingly difficult. She denies eye pain, redness, or flashes of light.
[OBJECTIVE]: Visual acuity is 20 over 60 in the right eye and 20 over 80 in the left eye, correctable only minimally with refraction. Slit lamp examination reveals significant nuclear sclerotic cataracts in both eyes, more advanced on the left. Intraocular pressures are normal. Dilated fundus examination is unremarkable.
[ASSESSMENT]: Bilateral visually significant cataracts.
[PLAN]: The patient is a candidate for cataract extraction with intraocular lens implantation. We discussed the risks and benefits of surgery, and she wishes to proceed with the left eye first. Preoperative measurements and biometry have been ordered.`,
      difficulty: 'Easy'
    },
    {
      title: 'Oncology - Breast Cancer Surveillance',
      description: 'Post-lumpectomy follow-up with mammogram review for a breast cancer survivor.',
      audioUrl: '/audio/onco_breast_v3.mp3',
      transcript: `[SUBJECTIVE]: The patient is a 58-year-old female with a history of early-stage breast cancer treated with lumpectomy and radiation two years ago. She presents for routine surveillance and reports no new breast lumps, nipple discharge, or pain. She has been adherent to her endocrine therapy. She denies bone pain, weight loss, or other constitutional symptoms.
[OBJECTIVE]: Breast examination reveals no palpable masses, skin changes, or axillary lymphadenopathy. Recent surveillance mammogram demonstrates no evidence of recurrent or new malignancy. No suspicious calcifications or architectural distortion are noted.
[ASSESSMENT]: No evidence of recurrent breast cancer on surveillance.
[PLAN]: The patient will continue endocrine therapy as prescribed and annual surveillance mammography. She was counseled to report any new symptoms promptly. Bone health monitoring will continue given her ongoing endocrine therapy.`,
      difficulty: 'Medium'
    },
    {
      title: 'Infectious Disease - Tuberculosis Screening',
      description: 'A patient with a positive PPD undergoes evaluation for latent tuberculosis.',
      audioUrl: '/audio/id_tb_v3.mp3',
      transcript: `[SUBJECTIVE]: The patient is a 29-year-old male healthcare worker who presents after a positive tuberculin skin test on routine employee screening. He reports no cough, fever, night sweats, weight loss, or hemoptysis. He has no known exposure to active tuberculosis but recently emigrated from a region with high tuberculosis prevalence. He denies any prior treatment for tuberculosis.
[OBJECTIVE]: The patient is afebrile with normal vital signs. Pulmonary examination is clear to auscultation bilaterally. There is no lymphadenopathy. A chest radiograph is normal with no evidence of active disease, cavitation, or hilar adenopathy.
[ASSESSMENT]: Latent tuberculosis infection with a positive tuberculin skin test and negative chest radiograph.
[PLAN]: We discussed the risks and benefits of treatment for latent tuberculosis. The patient will begin a course of isoniazid with pyridoxine supplementation. Baseline liver function tests were ordered and will be monitored monthly. The patient was counseled on signs of hepatotoxicity and the importance of medication adherence.`,
      difficulty: 'Hard'
    }
  ]

  for (const scenario of scenarios) {
    // We use title as the unique identifier to find the existing scenario
    const existing = await prisma.scenario.findFirst({
      where: { title: scenario.title }
    });
    
    await prisma.scenario.upsert({
      where: { id: existing?.id || '00000000-0000-0000-0000-000000000000' },
      update: scenario,
      create: scenario,
    });
  }

  console.log('Database seeded with SOAP scenarios successfully!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
