/**
 * questionnaireData.ts
 * 
 * A 120-item psychometric questionnaire dataset.
 * Questions are drawn from validated constructs:
 *   - Big Five (NEO-PI-R aligned): ~50 items
 *   - RIASEC Holland Codes: ~36 items
 *   - Emotional Intelligence & Core Values: ~34 items
 *
 * Each question is:
 *   - Ethically neutral (no caste, religion, political affiliation)
 *   - Linguistically simple (<15 words per question)
 *   - Culturally aware (India-context examples where applicable)
 *   - Reverse-scored where flagged to prevent acquiescence bias
 *
 * Trait dimensions:
 *   Big Five: openness, conscientiousness, extraversion, agreeableness, neuroticism
 *   RIASEC:   realistic, investigative, artistic, social, enterprising, conventional
 *   EI/Values: empathy, resilience, impulseControl, emotionalAwareness, socialIntuition
 */

export type TraitKey =
  // Big Five
  | 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'
  // RIASEC
  | 'realistic' | 'investigative' | 'artistic' | 'social' | 'enterprising' | 'conventional'
  // EI / Values
  | 'empathy' | 'resilience' | 'impulseControl' | 'emotionalAwareness' | 'socialIntuition';

export interface QuestionnaireItem {
  id: string;
  text: string;
  emoji: string;
  trait: TraitKey;
  weight: number;        // 1.0 = standard, 1.5 = high discriminating power
  reverseScored: boolean;
  category: 'personality' | 'career' | 'emotional';
}

// 5-point Likert scale used for all questions
// 1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree

export const QUESTIONNAIRE_ITEMS: QuestionnaireItem[] = [
  // ── BIG FIVE: OPENNESS (~15 items) ─────────────────────────────────────
  { id: 'O1', text: 'I love exploring new ideas and concepts.', emoji: '💡', trait: 'openness', weight: 1.5, reverseScored: false, category: 'personality' },
  { id: 'O2', text: 'I enjoy art, music, or creative writing.', emoji: '🎨', trait: 'openness', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'O3', text: 'I prefer familiar routines over new experiences.', emoji: '🔄', trait: 'openness', weight: 1.0, reverseScored: true, category: 'personality' },
  { id: 'O4', text: 'I am fascinated by how things work.', emoji: '⚙️', trait: 'openness', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'O5', text: 'I often think about abstract or philosophical ideas.', emoji: '🌌', trait: 'openness', weight: 1.5, reverseScored: false, category: 'personality' },
  { id: 'O6', text: 'I find learning new things exciting.', emoji: '📚', trait: 'openness', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'O7', text: 'I rarely question the way things are done.', emoji: '❓', trait: 'openness', weight: 1.0, reverseScored: true, category: 'personality' },
  { id: 'O8', text: 'I enjoy imagining fictional worlds or scenarios.', emoji: '🌠', trait: 'openness', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'O9', text: 'I am curious about different cultures and customs.', emoji: '🌍', trait: 'openness', weight: 1.5, reverseScored: false, category: 'personality' },
  { id: 'O10', text: 'I dislike abstract or theoretical discussions.', emoji: '🧩', trait: 'openness', weight: 1.0, reverseScored: true, category: 'personality' },
  { id: 'O11', text: 'I notice beauty in everyday things around me.', emoji: '🌸', trait: 'openness', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'O12', text: 'I get bored doing the same thing every day.', emoji: '😴', trait: 'openness', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'O13', text: 'I like experimenting to find better ways of doing things.', emoji: '🔬', trait: 'openness', weight: 1.5, reverseScored: false, category: 'personality' },
  { id: 'O14', text: 'I find it hard to think outside the box.', emoji: '📦', trait: 'openness', weight: 1.0, reverseScored: true, category: 'personality' },
  { id: 'O15', text: 'I enjoy visiting museums, exhibitions, or cultural events.', emoji: '🏛️', trait: 'openness', weight: 1.0, reverseScored: false, category: 'personality' },

  // ── BIG FIVE: CONSCIENTIOUSNESS (~13 items) ──────────────────────────────
  { id: 'C1', text: 'I always complete tasks on time.', emoji: '⏰', trait: 'conscientiousness', weight: 1.5, reverseScored: false, category: 'personality' },
  { id: 'C2', text: 'I keep my space organised and tidy.', emoji: '🗂️', trait: 'conscientiousness', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'C3', text: 'I often procrastinate when I have important tasks.', emoji: '⏳', trait: 'conscientiousness', weight: 1.5, reverseScored: true, category: 'personality' },
  { id: 'C4', text: 'I set clear goals and work systematically toward them.', emoji: '🎯', trait: 'conscientiousness', weight: 1.5, reverseScored: false, category: 'personality' },
  { id: 'C5', text: 'I pay close attention to detail in my work.', emoji: '🔍', trait: 'conscientiousness', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'C6', text: 'I sometimes act without thinking it through first.', emoji: '💨', trait: 'conscientiousness', weight: 1.0, reverseScored: true, category: 'personality' },
  { id: 'C7', text: 'I like to plan my week in advance.', emoji: '📅', trait: 'conscientiousness', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'C8', text: 'I keep my promises, even when it is inconvenient.', emoji: '🤝', trait: 'conscientiousness', weight: 1.5, reverseScored: false, category: 'personality' },
  { id: 'C9', text: 'I leave things unfinished more often than I should.', emoji: '🚧', trait: 'conscientiousness', weight: 1.0, reverseScored: true, category: 'personality' },
  { id: 'C10', text: 'I review my work carefully before submitting it.', emoji: '✅', trait: 'conscientiousness', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'C11', text: 'I work hard even when no one is watching.', emoji: '💪', trait: 'conscientiousness', weight: 1.5, reverseScored: false, category: 'personality' },
  { id: 'C12', text: 'I prefer to act spontaneously rather than stick to a plan.', emoji: '🎲', trait: 'conscientiousness', weight: 1.0, reverseScored: true, category: 'personality' },
  { id: 'C13', text: 'I feel uncomfortable when things are disorganised.', emoji: '📐', trait: 'conscientiousness', weight: 1.0, reverseScored: false, category: 'personality' },

  // ── BIG FIVE: EXTRAVERSION (~12 items) ──────────────────────────────────
  { id: 'E1', text: 'I feel energised after spending time with a large group.', emoji: '🎉', trait: 'extraversion', weight: 1.5, reverseScored: false, category: 'personality' },
  { id: 'E2', text: 'I find it easy to talk to strangers.', emoji: '💬', trait: 'extraversion', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'E3', text: 'I prefer to spend evenings alone rather than at social events.', emoji: '🏠', trait: 'extraversion', weight: 1.0, reverseScored: true, category: 'personality' },
  { id: 'E4', text: 'I enjoy being the centre of attention.', emoji: '⭐', trait: 'extraversion', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'E5', text: 'I am usually the one who initiates conversations.', emoji: '🗣️', trait: 'extraversion', weight: 1.5, reverseScored: false, category: 'personality' },
  { id: 'E6', text: 'After socialising for a long time, I feel drained.', emoji: '🔋', trait: 'extraversion', weight: 1.0, reverseScored: true, category: 'personality' },
  { id: 'E7', text: 'I thrive in a lively and fast-paced environment.', emoji: '⚡', trait: 'extraversion', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'E8', text: 'I prefer working alone to working in a team.', emoji: '🧍', trait: 'extraversion', weight: 1.0, reverseScored: true, category: 'personality' },
  { id: 'E9', text: 'People often describe me as enthusiastic and talkative.', emoji: '😄', trait: 'extraversion', weight: 1.5, reverseScored: false, category: 'personality' },
  { id: 'E10', text: 'I feel comfortable speaking in public.', emoji: '🎤', trait: 'extraversion', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'E11', text: 'I take charge in group situations.', emoji: '🦅', trait: 'extraversion', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'E12', text: 'I find loud, busy places overwhelming.', emoji: '😶', trait: 'extraversion', weight: 1.0, reverseScored: true, category: 'personality' },

  // ── BIG FIVE: AGREEABLENESS (~11 items) ─────────────────────────────────
  { id: 'A1', text: 'I genuinely care about other people\'s feelings.', emoji: '❤️', trait: 'agreeableness', weight: 1.5, reverseScored: false, category: 'personality' },
  { id: 'A2', text: 'I go out of my way to help friends or family.', emoji: '🤲', trait: 'agreeableness', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'A3', text: 'I find it difficult to trust people easily.', emoji: '🔒', trait: 'agreeableness', weight: 1.0, reverseScored: true, category: 'personality' },
  { id: 'A4', text: 'I prefer to cooperate rather than compete.', emoji: '🤜🤛', trait: 'agreeableness', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'A5', text: 'I sometimes feel little sympathy for people who complain.', emoji: '😑', trait: 'agreeableness', weight: 1.0, reverseScored: true, category: 'personality' },
  { id: 'A6', text: 'I believe most people have good intentions.', emoji: '🌟', trait: 'agreeableness', weight: 1.5, reverseScored: false, category: 'personality' },
  { id: 'A7', text: 'I am known for being kind and considerate.', emoji: '🌷', trait: 'agreeableness', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'A8', text: 'I can be blunt, even when it hurts others.', emoji: '🗡️', trait: 'agreeableness', weight: 1.0, reverseScored: true, category: 'personality' },
  { id: 'A9', text: 'I enjoy making other people\'s lives easier.', emoji: '😊', trait: 'agreeableness', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'A10', text: 'I often avoid conflict even when I disagree.', emoji: '🕊️', trait: 'agreeableness', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'A11', text: 'I can be cold and unfeeling in difficult situations.', emoji: '🧊', trait: 'agreeableness', weight: 1.0, reverseScored: true, category: 'personality' },

  // ── BIG FIVE: NEUROTICISM (~10 items) ───────────────────────────────────
  { id: 'N1', text: 'I often worry about things that might go wrong.', emoji: '😟', trait: 'neuroticism', weight: 1.5, reverseScored: false, category: 'personality' },
  { id: 'N2', text: 'I get stressed easily under pressure.', emoji: '🌪️', trait: 'neuroticism', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'N3', text: 'I stay calm in difficult situations.', emoji: '🧘', trait: 'neuroticism', weight: 1.5, reverseScored: true, category: 'personality' },
  { id: 'N4', text: 'My mood changes quickly without a clear reason.', emoji: '🎭', trait: 'neuroticism', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'N5', text: 'I often feel anxious or nervous about everyday things.', emoji: '💭', trait: 'neuroticism', weight: 1.5, reverseScored: false, category: 'personality' },
  { id: 'N6', text: 'I am emotionally stable and rarely get upset.', emoji: '⚖️', trait: 'neuroticism', weight: 1.0, reverseScored: true, category: 'personality' },
  { id: 'N7', text: 'I feel sad or depressed more than others seem to.', emoji: '🌧️', trait: 'neuroticism', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'N8', text: 'I bounce back quickly from setbacks.', emoji: '🏀', trait: 'neuroticism', weight: 1.5, reverseScored: true, category: 'personality' },
  { id: 'N9', text: 'I often feel self-conscious in social situations.', emoji: '😳', trait: 'neuroticism', weight: 1.0, reverseScored: false, category: 'personality' },
  { id: 'N10', text: 'Small frustrations rarely bother me.', emoji: '😌', trait: 'neuroticism', weight: 1.0, reverseScored: true, category: 'personality' },

  // ── RIASEC: REALISTIC (~7 items) ────────────────────────────────────────
  { id: 'R1', text: 'I enjoy working with tools, machines, or technology.', emoji: '🔧', trait: 'realistic', weight: 1.5, reverseScored: false, category: 'career' },
  { id: 'R2', text: 'I prefer practical, hands-on activities over theoretical ones.', emoji: '🏗️', trait: 'realistic', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'R3', text: 'I like building or repairing things.', emoji: '🛠️', trait: 'realistic', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'R4', text: 'I enjoy physical activities like sports or outdoor work.', emoji: '⛰️', trait: 'realistic', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'R5', text: 'I prefer working with my hands rather than my mind.', emoji: '🖐️', trait: 'realistic', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'R6', text: 'I enjoy working in nature or with animals.', emoji: '🌿', trait: 'realistic', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'R7', text: 'I would enjoy a career in engineering or manufacturing.', emoji: '🏭', trait: 'realistic', weight: 1.5, reverseScored: false, category: 'career' },

  // ── RIASEC: INVESTIGATIVE (~7 items) ────────────────────────────────────
  { id: 'I1', text: 'I love solving complex puzzles and problems.', emoji: '🧩', trait: 'investigative', weight: 1.5, reverseScored: false, category: 'career' },
  { id: 'I2', text: 'I enjoy reading about science or technology.', emoji: '🔭', trait: 'investigative', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'I3', text: 'I prefer to analyse situations before acting.', emoji: '📊', trait: 'investigative', weight: 1.5, reverseScored: false, category: 'career' },
  { id: 'I4', text: 'I enjoy conducting experiments or research.', emoji: '⚗️', trait: 'investigative', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'I5', text: 'I ask "why" before I accept something as true.', emoji: '🤔', trait: 'investigative', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'I6', text: 'I enjoy maths or logic-based challenges.', emoji: '➕', trait: 'investigative', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'I7', text: 'I would enjoy a career in medicine, law, or research.', emoji: '🩺', trait: 'investigative', weight: 1.5, reverseScored: false, category: 'career' },

  // ── RIASEC: ARTISTIC (~6 items) ─────────────────────────────────────────
  { id: 'Art1', text: 'I express myself through writing, drawing, or music.', emoji: '🎭', trait: 'artistic', weight: 1.5, reverseScored: false, category: 'career' },
  { id: 'Art2', text: 'I like creating original things.', emoji: '✨', trait: 'artistic', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'Art3', text: 'I see myself as imaginative and creative.', emoji: '🌈', trait: 'artistic', weight: 1.5, reverseScored: false, category: 'career' },
  { id: 'Art4', text: 'I enjoy storytelling or performing in front of others.', emoji: '🎬', trait: 'artistic', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'Art5', text: 'Rules and structure feel limiting to me.', emoji: '🚫', trait: 'artistic', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'Art6', text: 'I would enjoy a career in design, film, or the arts.', emoji: '🎨', trait: 'artistic', weight: 1.5, reverseScored: false, category: 'career' },

  // ── RIASEC: SOCIAL (~6 items) ───────────────────────────────────────────
  { id: 'S1', text: 'I enjoy helping others learn or grow.', emoji: '🌱', trait: 'social', weight: 1.5, reverseScored: false, category: 'career' },
  { id: 'S2', text: 'I feel fulfilled when I make a positive difference.', emoji: '💚', trait: 'social', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'S3', text: 'I enjoy counselling or mentoring people.', emoji: '🧑‍🏫', trait: 'social', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'S4', text: 'I am good at understanding how others feel.', emoji: '💞', trait: 'social', weight: 1.5, reverseScored: false, category: 'career' },
  { id: 'S5', text: 'I enjoy volunteering or community service.', emoji: '🙌', trait: 'social', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'S6', text: 'I would enjoy a career in education, healthcare, or social work.', emoji: '🏥', trait: 'social', weight: 1.5, reverseScored: false, category: 'career' },

  // ── RIASEC: ENTERPRISING (~5 items) ─────────────────────────────────────
  { id: 'En1', text: 'I enjoy leading and motivating others.', emoji: '🚀', trait: 'enterprising', weight: 1.5, reverseScored: false, category: 'career' },
  { id: 'En2', text: 'I am comfortable taking risks to achieve big goals.', emoji: '🎰', trait: 'enterprising', weight: 1.5, reverseScored: false, category: 'career' },
  { id: 'En3', text: 'I enjoy negotiating or persuading people.', emoji: '🤝', trait: 'enterprising', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'En4', text: 'I enjoy competition and working toward being the best.', emoji: '🏆', trait: 'enterprising', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'En5', text: 'I would enjoy starting my own business or being an entrepreneur.', emoji: '💼', trait: 'enterprising', weight: 1.5, reverseScored: false, category: 'career' },

  // ── RIASEC: CONVENTIONAL (~5 items) ─────────────────────────────────────
  { id: 'Cv1', text: 'I prefer clear rules and structured environments.', emoji: '📋', trait: 'conventional', weight: 1.5, reverseScored: false, category: 'career' },
  { id: 'Cv2', text: 'I enjoy organising data, files, or information.', emoji: '📁', trait: 'conventional', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'Cv3', text: 'I am good at following detailed instructions.', emoji: '📝', trait: 'conventional', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'Cv4', text: 'I like working within established systems and processes.', emoji: '⚙️', trait: 'conventional', weight: 1.0, reverseScored: false, category: 'career' },
  { id: 'Cv5', text: 'I would enjoy a career in finance, administration, or data management.', emoji: '💹', trait: 'conventional', weight: 1.5, reverseScored: false, category: 'career' },

  // ── EMOTIONAL INTELLIGENCE: EMPATHY (~7 items) ───────────────────────────
  { id: 'Emp1', text: 'I can tell how someone is feeling just by looking at them.', emoji: '👁️', trait: 'empathy', weight: 1.5, reverseScored: false, category: 'emotional' },
  { id: 'Emp2', text: 'I feel deeply affected when someone I care about is hurting.', emoji: '💔', trait: 'empathy', weight: 1.0, reverseScored: false, category: 'emotional' },
  { id: 'Emp3', text: 'I try to understand someone\'s point of view, even if I disagree.', emoji: '🔭', trait: 'empathy', weight: 1.5, reverseScored: false, category: 'emotional' },
  { id: 'Emp4', text: 'I rarely consider how my words might affect others.', emoji: '🗣️', trait: 'empathy', weight: 1.0, reverseScored: true, category: 'emotional' },
  { id: 'Emp5', text: 'I feel moved by stories of struggle or injustice.', emoji: '😢', trait: 'empathy', weight: 1.0, reverseScored: false, category: 'emotional' },
  { id: 'Emp6', text: 'I notice when someone in a group feels left out.', emoji: '👥', trait: 'empathy', weight: 1.0, reverseScored: false, category: 'emotional' },
  { id: 'Emp7', text: 'I often think about how my decisions affect others.', emoji: '🌍', trait: 'empathy', weight: 1.5, reverseScored: false, category: 'emotional' },

  // ── EMOTIONAL INTELLIGENCE: RESILIENCE (~7 items) ────────────────────────
  { id: 'Res1', text: 'I recover quickly when things do not go my way.', emoji: '⚡', trait: 'resilience', weight: 1.5, reverseScored: false, category: 'emotional' },
  { id: 'Res2', text: 'I see failures as opportunities to learn.', emoji: '🌱', trait: 'resilience', weight: 1.5, reverseScored: false, category: 'emotional' },
  { id: 'Res3', text: 'I give up easily when challenges become too hard.', emoji: '🚩', trait: 'resilience', weight: 1.5, reverseScored: true, category: 'emotional' },
  { id: 'Res4', text: 'I stay motivated even when progress feels slow.', emoji: '🌊', trait: 'resilience', weight: 1.0, reverseScored: false, category: 'emotional' },
  { id: 'Res5', text: 'Criticism helps me become better, not worse.', emoji: '🔔', trait: 'resilience', weight: 1.0, reverseScored: false, category: 'emotional' },
  { id: 'Res6', text: 'I feel helpless when things are out of my control.', emoji: '😔', trait: 'resilience', weight: 1.0, reverseScored: true, category: 'emotional' },
  { id: 'Res7', text: 'I adapt well to change and uncertainty.', emoji: '🌀', trait: 'resilience', weight: 1.5, reverseScored: false, category: 'emotional' },

  // ── EMOTIONAL INTELLIGENCE: IMPULSE CONTROL (~6 items) ──────────────────
  { id: 'Imp1', text: 'I think before I speak, especially in heated moments.', emoji: '🤫', trait: 'impulseControl', weight: 1.5, reverseScored: false, category: 'emotional' },
  { id: 'Imp2', text: 'I often say things I later regret.', emoji: '😬', trait: 'impulseControl', weight: 1.0, reverseScored: true, category: 'emotional' },
  { id: 'Imp3', text: 'I can delay a small reward for a bigger future benefit.', emoji: '🍬', trait: 'impulseControl', weight: 1.5, reverseScored: false, category: 'emotional' },
  { id: 'Imp4', text: 'I struggle to resist temptations or distractions.', emoji: '📱', trait: 'impulseControl', weight: 1.0, reverseScored: true, category: 'emotional' },
  { id: 'Imp5', text: 'I stay focused on my goals even when distracted.', emoji: '🎯', trait: 'impulseControl', weight: 1.0, reverseScored: false, category: 'emotional' },
  { id: 'Imp6', text: 'I react strongly to frustration or anger.', emoji: '🌋', trait: 'impulseControl', weight: 1.0, reverseScored: true, category: 'emotional' },

  // ── EMOTIONAL INTELLIGENCE: EMOTIONAL AWARENESS (~7 items) ──────────────
  { id: 'EA1', text: 'I can name exactly what I am feeling in the moment.', emoji: '🏷️', trait: 'emotionalAwareness', weight: 1.5, reverseScored: false, category: 'emotional' },
  { id: 'EA2', text: 'I often feel emotions without understanding why.', emoji: '❓', trait: 'emotionalAwareness', weight: 1.0, reverseScored: true, category: 'emotional' },
  { id: 'EA3', text: 'I understand how my emotions influence my decisions.', emoji: '🧠', trait: 'emotionalAwareness', weight: 1.5, reverseScored: false, category: 'emotional' },
  { id: 'EA4', text: 'I notice physical signs of stress in my body (like tension or a racing heart).', emoji: '💓', trait: 'emotionalAwareness', weight: 1.0, reverseScored: false, category: 'emotional' },
  { id: 'EA5', text: 'I regularly reflect on my own feelings and thoughts.', emoji: '🪞', trait: 'emotionalAwareness', weight: 1.0, reverseScored: false, category: 'emotional' },
  { id: 'EA6', text: 'I find it hard to describe how I feel to others.', emoji: '🤷', trait: 'emotionalAwareness', weight: 1.0, reverseScored: true, category: 'emotional' },
  { id: 'EA7', text: 'I am aware of my personal strengths and weaknesses.', emoji: '⚖️', trait: 'emotionalAwareness', weight: 1.5, reverseScored: false, category: 'emotional' },

  // ── EMOTIONAL INTELLIGENCE: SOCIAL INTUITION (~7 items) ─────────────────
  { id: 'SI1', text: 'I can easily read the mood of a room I walk into.', emoji: '🎭', trait: 'socialIntuition', weight: 1.5, reverseScored: false, category: 'emotional' },
  { id: 'SI2', text: 'I know when a friendship or situation is changing.', emoji: '🌊', trait: 'socialIntuition', weight: 1.0, reverseScored: false, category: 'emotional' },
  { id: 'SI3', text: 'I often misread people\'s intentions.', emoji: '😕', trait: 'socialIntuition', weight: 1.0, reverseScored: true, category: 'emotional' },
  { id: 'SI4', text: 'I understand unspoken social rules and norms.', emoji: '🤫', trait: 'socialIntuition', weight: 1.0, reverseScored: false, category: 'emotional' },
  { id: 'SI5', text: 'People often confide in me with their problems.', emoji: '🔐', trait: 'socialIntuition', weight: 1.5, reverseScored: false, category: 'emotional' },
  { id: 'SI6', text: 'I find it hard to sense when someone is upset with me.', emoji: '🤔', trait: 'socialIntuition', weight: 1.0, reverseScored: true, category: 'emotional' },
  { id: 'SI7', text: 'I can adjust my communication style for different people.', emoji: '🎙️', trait: 'socialIntuition', weight: 1.5, reverseScored: false, category: 'emotional' },
];

export const TOTAL_QUESTIONS = QUESTIONNAIRE_ITEMS.length;
