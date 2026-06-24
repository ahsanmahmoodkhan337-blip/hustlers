import * as googleTTS from 'google-tts-api';
import * as fs from 'fs';
import * as path from 'fs';
import axios from 'axios';

const scenarios = [
  {
    fileName: 'cardiology_followup_v2.mp3',
    transcript: 'The patient is a 58-year-old male who presents today for follow-up of coronary artery disease and recent episodes of atypical chest pain. He states that the chest pain is sharp, fleeting, and does not seem to be associated with exertion. His blood pressure is well-controlled on Lisinopril, and he reports no shortness of breath, palpitations, or lightheadedness. On physical exam, his lungs are clear to auscultation bilaterally, and his heart rate is regular with no murmurs, rubs, or gallops. Electrocardiogram performed in the office shows normal sinus rhythm with no acute ST-T changes. We will proceed with a treadmill stress test to rule out any inducible ischemia and continue his current medication regimen.',
  },
  {
    fileName: 'ed_appendicitis_v2.mp3',
    transcript: 'This is a 12-year-old female who presents to the emergency department with a 24-hour history of progressive abdominal pain, which started in the periumbilical region and has now localized to the right lower quadrant. The pain is associated with loss of appetite, nausea, and two episodes of non-bilious vomiting. On physical examination, the patient is febrile with a temperature of 101.2 degrees Fahrenheit. Abdominal exam is notable for moderate to severe tenderness in the right lower quadrant with positive rebound and guarding at McBurney\'s point. Laboratory evaluation is significant for leukocytosis with a white blood cell count of 14,000. An ultrasound of the appendix has been ordered to confirm the diagnosis of acute appendicitis.',
  },
  {
    fileName: 'pediatric_checkup_v2.mp3',
    transcript: 'The patient is a 4-year-old male who presents today with his mother for a well-child checkup. The mother reports that the child is active, eating well, and meeting all developmental milestones. On physical examination, the child is well-nourished and in no acute distress. Immunizations are up to date, and growth charts show both height and weight are tracking along the 65th percentile.',
  },
  {
    fileName: 'neurology_migraine_v2.mp3',
    transcript: 'The patient is a 34-year-old female with a long-standing history of chronic migraines, presenting today for a follow-up and medication review. She reports that her headache frequency has increased to approximately three times per week over the last month. The headaches are typically unilateral, throbbing in nature, and accompanied by photophobia and phonophobia. She has been using Sumatriptan as an abortive therapy with moderate success but is requesting a more effective prophylactic regimen. We discussed starting Topiramate at a low dose and gradually titrating up. She was advised on potential side effects and the importance of maintaining a headache diary. We will re-evaluate her progress in six weeks.',
  },
  {
    fileName: 'ortho_knee_v2.mp3',
    transcript: 'The patient is a 62-year-old male presenting with a two-year history of worsening bilateral knee pain, right greater than left. He describes the pain as a dull ache that is aggravated by prolonged standing and climbing stairs. He has tried conservative management including physical therapy and over-the-counter anti-inflammatories without significant relief. Physical examination reveals crepitus and limited range of motion in both knees. Radiographs demonstrate significant joint space narrowing and osteophyte formation consistent with Grade 3 osteoarthritis. We discussed the options of intra-articular corticosteroid injections versus proceeding with a total knee arthroplasty. The patient has elected to start with a trial of injections today.',
  },
  {
    fileName: 'gi_gerd_v2.mp3',
    transcript: 'This 45-year-old male returns for follow-up of gastroesophageal reflux disease. He has been taking Omeprazole 20 mg daily with good control of his symptoms, including heartburn and regurgitation. He denies any dysphagia, weight loss, or change in bowel habits. His last upper endoscopy, performed one year ago, showed mild esophagitis but was negative for Barrett’s esophagus. We will continue his current dose of Omeprazole and encouraged him to follow dietary modifications, such as avoiding spicy foods and not eating late at night. He is scheduled for a follow-up endoscopy in two years.',
  },
  {
    fileName: 'derm_eczema_v2.mp3',
    transcript: 'The patient is a 19-year-old male presenting with a flare-up of atopic dermatitis involving the flexural surfaces of his elbows and knees. He reports significant pruritus that interferes with his sleep. On examination, there are erythematous, excoriated plaques in the classic distribution. There is no evidence of secondary bacterial infection. We will prescribe a medium-potency topical corticosteroid for the active lesions and emphasized the importance of regular use of emollients and gentle skin care. He was also advised to avoid known triggers and to return if there is no improvement within two weeks.',
  },
  {
    fileName: 'psych_anxiety_v2.mp3',
    transcript: 'This 28-year-old female presents for an initial psychiatric evaluation due to persistent feelings of worry and tension that have been present for the past eight months. She describes difficulty concentrating, muscle tension, and sleep disturbance. These symptoms are causing significant distress and impairment in her occupational functioning. She denies any history of panic attacks or obsessive-compulsive behaviors. After a thorough clinical interview and review of symptoms, she meets the criteria for generalized anxiety disorder. We discussed a treatment plan involving both cognitive-behavioral therapy and the initiation of a selective serotonin reuptake inhibitor, specifically Sertraline. The patient is agreeable to this combined approach and will follow up in three weeks to monitor for response and side effects.',
  }
];

async function downloadAudio(url: string, dest: string) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  const writer = fs.createWriteStream(dest);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function main() {
  const audioDir = path.join(process.cwd(), 'public/audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  for (const scenario of scenarios) {
    console.log(`Generating audio for: ${scenario.fileName}`);
    try {
      const results = googleTTS.getAllAudioUrls(scenario.transcript, {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
      });
      console.log(`Split into ${results.length} parts for ${scenario.fileName}`);

      // We'll combine them if multiple, but for now let's just download the first one if short or handle multiple
      // Actually, let's just download all parts and concatenate them using a temporary buffer if needed
      // Or easier: just use the first part if it's mostly complete, but these are long.
      
      const filePaths: string[] = [];
      for (let i = 0; i < results.length; i++) {
        const partPath = path.join(audioDir, `${scenario.fileName}.part${i}`);
        await downloadAudio(results[i].url, partPath);
        filePaths.push(partPath);
      }

      // Combine parts
      const finalPath = path.join(audioDir, scenario.fileName);
      const finalWriter = fs.createWriteStream(finalPath);
      for (const partPath of filePaths) {
        const data = fs.readFileSync(partPath);
        finalWriter.write(data);
        fs.unlinkSync(partPath);
      }
      finalWriter.end();
      console.log(`Successfully generated ${scenario.fileName}`);
    } catch (err) {
      console.error(`Failed to generate ${scenario.fileName}:`, err);
    }
  }
}

main();
