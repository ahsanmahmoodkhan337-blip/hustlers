import * as googleTTS from 'google-tts-api';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const scenarios = [
  {
    fileName: 'cardiology_followup_v3.mp3',
    transcript: `[SUBJECTIVE]: The patient is a 58-year-old male who presents today for follow-up of coronary artery disease and recent episodes of atypical chest pain. He states that the chest pain is sharp, fleeting, and does not seem to be associated with exertion or diaphoresis. He denies any radiation to the left arm or jaw. He has been adherent to his medication regimen, which includes Lisinopril and Atorvastatin. He reports no shortness of breath, palpitations, or lightheadedness. 
[OBJECTIVE]: Blood pressure is 128/78, heart rate is 72 beats per minute, and oxygen saturation is 98% on room air. On physical exam, the patient is in no acute distress. Lungs are clear to auscultation bilaterally. Heart rate is regular with no murmurs, rubs, or gallops. No peripheral edema noted. Electrocardiogram performed in the office shows normal sinus rhythm with no acute ST-segment or T-wave changes.
[ASSESSMENT]: Stable coronary artery disease with atypical chest pain, likely musculoskeletal or gastrointestinal in origin, though inducible ischemia cannot be entirely ruled out based on symptoms alone.
[PLAN]: We will proceed with a treadmill stress test to rule out any inducible ischemia. The patient was instructed to continue his current medication regimen and to present to the emergency department if his chest pain becomes crushing, prolonged, or associated with shortness of breath.`,
  },
  {
    fileName: 'ed_appendicitis_v3.mp3',
    transcript: `[SUBJECTIVE]: This is a 12-year-old female who presents to the emergency department with a 24-hour history of progressive abdominal pain. The pain initially started in the periumbilical region and has since localized to the right lower quadrant. The mother reports the patient has a loss of appetite, nausea, and has had two episodes of non-bilious vomiting. No history of urinary symptoms or change in bowel habits.
[OBJECTIVE]: Temperature is 101.2 degrees Fahrenheit, heart rate is 110, and blood pressure is 105/65. On physical examination, the patient appears ill and is lying still on the gurney. Abdominal exam is notable for moderate to severe tenderness in the right lower quadrant. There is positive rebound tenderness and guarding at McBurney's point. Rovsing's sign is also positive.
[ASSESSMENT]: Acute appendicitis.
[PLAN]: The patient will be kept NPO. We have ordered intravenous fluids and analgesia. Laboratory evaluation shows leukocytosis with a white blood cell count of 14,000. An ultrasound of the appendix is pending to confirm the diagnosis. We have consulted the pediatric surgery team for evaluation and potential appendectomy.`,
  },
  {
    fileName: 'pediatric_checkup_v3.mp3',
    transcript: `[SUBJECTIVE]: The patient is a 4-year-old male who presents today with his mother for a routine well-child checkup. The mother reports that the child is active, eating a balanced diet, and meeting all developmental milestones. He has started preschool and is interacting well with peers. There are no concerns regarding his hearing, vision, or sleep patterns.
[OBJECTIVE]: Height and weight are tracking along the 65th percentile. Vital signs are normal for his age. On physical examination, the child is well-nourished, cooperative, and in no acute distress. Neurological exam shows age-appropriate gross and fine motor skills. Cardiovascular and respiratory exams are unremarkable.
[ASSESSMENT]: Healthy 4-year-old male, meeting all developmental milestones.
[PLAN]: Immunizations were reviewed and are up to date. We discussed the importance of continued healthy eating, daily physical activity, and limit on screen time. The next well-child visit is scheduled for one year.`,
  },
  {
    fileName: 'neurology_migraine_v3.mp3',
    transcript: `[SUBJECTIVE]: The patient is a 34-year-old female with a long-standing history of chronic migraines. She presents today for a follow-up and medication review. She reports that her headache frequency has increased to approximately three times per week over the last month. The headaches are unilateral, throbbing, and associated with photophobia, phonophobia, and occasional nausea. She has been using Sumatriptan as an abortive therapy but feels it is no longer sufficient.
[OBJECTIVE]: Vital signs are stable. Neurological examination, including cranial nerves, motor, and sensory testing, is completely normal. There is no evidence of papilledema on funduscopic exam.
[ASSESSMENT]: Chronic migraines with increased frequency, requiring transition from abortive-only therapy to a prophylactic regimen.
[PLAN]: We discussed starting Topiramate at 25 mg daily, titrating up slowly to 50 mg twice daily as tolerated. The patient was advised on potential side effects, including paresthesia and cognitive dampening. She will maintain a headache diary to track frequency and triggers. We will re-evaluate her progress in six weeks.`,
  },
  {
    fileName: 'ortho_knee_v3.mp3',
    transcript: `[SUBJECTIVE]: The patient is a 62-year-old male presenting with a two-year history of worsening bilateral knee pain, right greater than left. He describes the pain as a dull ache that is aggravated by prolonged standing, walking on hard surfaces, and climbing stairs. He has tried physical therapy and over-the-counter anti-inflammatories with only temporary relief. He denies any recent trauma or locking of the joints.
[OBJECTIVE]: Physical examination reveals crepitus and limited range of motion in both knees, particularly on the right side. There is mild joint line tenderness but no significant effusion. Radiographs demonstrate significant joint space narrowing and osteophyte formation in the medial compartments.
[ASSESSMENT]: Grade 3 bilateral knee osteoarthritis.
[PLAN]: We discussed the options of intra-articular corticosteroid injections versus proceeding with a total knee arthroplasty. The patient is not ready for surgery and has elected to start with a trial of injections today. He was also encouraged to continue low-impact exercise and weight management.`,
  },
  {
    fileName: 'gi_gerd_v3.mp3',
    transcript: `[SUBJECTIVE]: This 45-year-old male returns for follow-up of gastroesophageal reflux disease. He has been taking Omeprazole 20 mg daily with good control of his symptoms, including heartburn and acid regurgitation. He denies any dysphagia, weight loss, or change in bowel habits. He reports he has been trying to follow dietary modifications but find it difficult during work travel.
[OBJECTIVE]: On examination, the abdomen is soft, non-tender, and non-distended. No masses or organomegaly noted. Bowel sounds are normal in all four quadrants.
[ASSESSMENT]: Stable GERD on proton pump inhibitor therapy.
[PLAN]: We will continue his current dose of Omeprazole. We re-emphasized the importance of avoiding late-night meals and spicy or fatty foods. His last upper endoscopy was negative for Barrett’s esophagus; we will schedule a follow-up endoscopy in two years to monitor for any mucosal changes.`,
  },
  {
    fileName: 'derm_eczema_v3.mp3',
    transcript: `[SUBJECTIVE]: The patient is a 19-year-old male presenting with a flare-up of atopic dermatitis. He reports significant pruritus involving the flexural surfaces of his elbows and knees, which has been present for the last two weeks. The itching is worse at night and interferes with his sleep. He has been using over-the-counter lotions without improvement.
[OBJECTIVE]: On examination, there are erythematous, excoriated, and lichenified plaques in the antecubital and popliteal fossae. There is no evidence of honey-colored crusting or secondary bacterial infection. The remainder of the skin is dry but clear.
[ASSESSMENT]: Acute flare of atopic dermatitis (eczema).
[PLAN]: We will prescribe Triamcinolone 0.1% cream to be applied to the active lesions twice daily for two weeks. He was advised on the importance of regular use of thick emollients and to avoid harsh soaps or hot showers. We will follow up in three weeks if the symptoms do not resolve.`,
  },
  {
    fileName: 'psych_anxiety_v3.mp3',
    transcript: `[SUBJECTIVE]: This 28-year-old female presents for an initial psychiatric evaluation due to persistent feelings of worry and tension present for the past eight months. She describes difficulty concentrating, muscle tension, and significant sleep disturbance. These symptoms are causing distress and impairment in her performance at work. She denies any history of panic attacks, obsessive thoughts, or suicidal ideation.
[OBJECTIVE]: On mental status examination, the patient is alert and oriented. Her speech is at a normal rate and volume. Her mood is described as "anxious" with a congruent, constricted affect. Her thought process is linear and goal-directed. Insight and judgment are fair.
[ASSESSMENT]: Generalized Anxiety Disorder (GAD).
[PLAN]: We discussed a treatment plan involving both cognitive-behavioral therapy and the initiation of a selective serotonin reuptake inhibitor. We will start Sertraline 25 mg daily for one week, then increase to 50 mg. The patient is agreeable to this approach and will follow up in three weeks to monitor for therapeutic response and potential side effects.`,
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
