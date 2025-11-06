import { connect, connection, Schema } from 'mongoose';
import { TaskType } from '../lessons/schemas/task.schema';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') });

interface TaskData {
  lessonId: any;
  type: string;
  order: number;
  title?: string;
  description?: string;
  [key: string]: any;
}

async function seed() {
  // Connect to database
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.log(
      '❌ MONGO_URI not found. Please set it in your environment variables.',
    );
    process.exit(1);
  }

  try {
    await connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const TaskModel =
      connection.models.Tasks ||
      connection.model(
        'Tasks',
        new Schema({}, { collection: 'tasks', strict: false }),
      );
    const LessonModel =
      connection.models.Lessons ||
      connection.model(
        'Lessons',
        new Schema({}, { collection: 'lessons', strict: false }),
      );

    // Find a lesson to attach tasks to
    const lesson = await LessonModel.findOne({});

    if (!lesson) {
      console.log('❌ No lessons found. Please create a lesson first.');
      await connection.close();
      process.exit(1);
    }

    const lessonId = lesson._id;
    console.log(`✅ Using lesson: ${(lesson as any).title} (${lessonId})`);

    // Check if tasks already exist for this lesson
    const existingTasksCount = await TaskModel.countDocuments({ lessonId });
    if (existingTasksCount > 0) {
      console.log(
        `⚠️  This lesson already has ${existingTasksCount} tasks. Creating additional tasks...`,
      );
    }

    // Define tasks for each task type (2 tasks per type, excluding VIDEO, TEXT, FILE)
    const tasks: TaskData[] = [];

    // 1. Lead-in tasks (2 tasks)
    tasks.push({
      lessonId,
      type: TaskType.LEAD_IN,
      order: existingTasksCount + 1,
      title: 'Warm-up Discussion',
      description: 'Warm-up activity to get started',
      textPrompt:
        'Think about your favorite IELTS topic. Share three reasons why you find it interesting.',
      imageUrl:
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
    });

    tasks.push({
      lessonId,
      type: TaskType.LEAD_IN,
      order: existingTasksCount + 2,
      title: 'Discussion Prompt',
      description: 'Engage with the topic',
      textPrompt:
        'What does the term "global citizenship" mean to you? Discuss with a partner.',
      imageUrl:
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    });

    // 2. Listening MCQ tasks (2 tasks)
    tasks.push({
      lessonId,
      type: TaskType.LISTENING_MCQ,
      order: existingTasksCount + 3,
      title: 'Airport Announcement',
      description: 'Listen and choose the correct answer',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      options: ['Gate 12', 'Gate 15', 'Gate 18', 'Gate 22'],
      correctOptionIndex: 1,
    });

    tasks.push({
      lessonId,
      type: TaskType.LISTENING_MCQ,
      order: existingTasksCount + 4,
      title: 'Hotel Booking',
      description: 'Listen to a telephone conversation',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      options: ['Single room', 'Double room', 'Suite', 'Family room'],
      correctOptionIndex: 2,
    });

    // 3. Recording tasks (2 tasks)
    tasks.push({
      lessonId,
      type: TaskType.RECORDING,
      order: existingTasksCount + 5,
      title: 'Personal Introduction',
      description: 'Record yourself introducing yourself',
      promptText:
        'Tell us about yourself. Include your name, hometown, and occupation.',
      maxDuration: 120,
      sampleAnswerAudioUrl:
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    });

    tasks.push({
      lessonId,
      type: TaskType.RECORDING,
      order: existingTasksCount + 6,
      title: 'Describe Your Hometown',
      description: 'Record a description',
      promptText:
        'Describe your hometown. Talk about the location, population, and main features.',
      maxDuration: 180,
      sampleAnswerAudioUrl:
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    });

    // 4. Matching tasks (2 tasks)
    tasks.push({
      lessonId,
      type: TaskType.MATCHING,
      order: existingTasksCount + 7,
      title: 'Match Definitions',
      description: 'Match words with their meanings',
      pairs: [
        { left: 'Climate', right: 'Weather patterns over time' },
        { left: 'Weather', right: 'Current atmospheric conditions' },
        { left: 'Temperature', right: 'Degree of heat or cold' },
        { left: 'Precipitation', right: 'Rain, snow, or hail' },
      ],
      correctPairs: [
        { leftIndex: 0, rightIndex: 1 },
        { leftIndex: 1, rightIndex: 2 },
        { leftIndex: 2, rightIndex: 0 },
        { leftIndex: 3, rightIndex: 3 },
      ],
    });

    tasks.push({
      lessonId,
      type: TaskType.MATCHING,
      order: existingTasksCount + 8,
      title: 'Match Synonyms',
      description: 'Match words with similar meanings',
      pairs: [
        { left: 'Happy', right: 'Joyful' },
        { left: 'Sad', right: 'Miserable' },
        { left: 'Big', right: 'Large' },
        { left: 'Small', right: 'Tiny' },
      ],
      correctPairs: [
        { leftIndex: 0, rightIndex: 0 },
        { leftIndex: 1, rightIndex: 1 },
        { leftIndex: 2, rightIndex: 2 },
        { leftIndex: 3, rightIndex: 3 },
      ],
    });

    // 5. Ranking tasks (2 tasks)
    tasks.push({
      lessonId,
      type: TaskType.RANKING,
      order: existingTasksCount + 9,
      title: 'Rank by Frequency',
      description: 'Rank items by how often they occur',
      items: [
        'Earthquakes in the region',
        'Heavy rain',
        'Light drizzle',
        'Snow',
      ],
      correctOrder: [2, 1, 0, 3],
    });

    tasks.push({
      lessonId,
      type: TaskType.RANKING,
      order: existingTasksCount + 10,
      title: 'Rank by Importance',
      description: 'Rank by importance',
      items: ['Clean water', 'Entertainment', 'Education', 'Health care'],
      correctOrder: [0, 3, 2, 1],
    });

    // 6. Fill-in-the-Blank tasks (2 tasks)
    tasks.push({
      lessonId,
      type: TaskType.FILL_IN_BLANK,
      order: existingTasksCount + 11,
      title: 'Complete the Sentence',
      description: 'Fill in the blanks using the word bank',
      textTemplate: 'The __1__ is very __2__ today.',
      wordBank: ['weather', 'sunny', 'climate', 'temperature'],
      correctAnswers: new Map([
        ['1', 'weather'],
        ['2', 'sunny'],
      ]),
    });

    tasks.push({
      lessonId,
      type: TaskType.FILL_IN_BLANK,
      order: existingTasksCount + 12,
      title: 'Sentence Completion',
      description: 'Complete sentences',
      textTemplate: 'She __1__ the book and __2__ it on the shelf.',
      wordBank: ['read', 'placed', 'wrote', 'bought'],
      correctAnswers: new Map([
        ['1', 'read'],
        ['2', 'placed'],
      ]),
    });

    // 7. Multiple Choice tasks (2 tasks)
    tasks.push({
      lessonId,
      type: TaskType.MULTIPLE_CHOICE,
      order: existingTasksCount + 13,
      title: 'Reading Comprehension',
      description: 'Choose the correct answers',
      textPrompt: 'What are the main themes of the passage?',
      options: [
        'Environmental issues',
        'Economic growth',
        'Social changes',
        'Technological advances',
      ],
      correctOptionIndices: [0, 2],
    });

    tasks.push({
      lessonId,
      type: TaskType.MULTIPLE_CHOICE,
      order: existingTasksCount + 14,
      title: 'Multiple Correct Answers',
      description: 'Select all correct options',
      textPrompt: 'Which statements are true about the text?',
      options: [
        'Statement A is correct',
        'Statement B is correct',
        'Statement C is incorrect',
        'Statement D is correct',
      ],
      correctOptionIndices: [0, 1, 3],
    });

    // 8. True/False tasks (2 tasks)
    tasks.push({
      lessonId,
      type: TaskType.TRUE_FALSE,
      order: existingTasksCount + 15,
      title: 'Mark Statements',
      description: 'Determine if statements are true or false',
      statements: [
        'The Earth revolves around the Sun.',
        'Water boils at 100 degrees Celsius.',
        'Sharks are mammals.',
      ],
      correctFlags: [true, true, false],
    });

    tasks.push({
      lessonId,
      type: TaskType.TRUE_FALSE,
      order: existingTasksCount + 16,
      title: 'Verification Task',
      description: 'Verify these statements',
      statements: [
        'IELTS has four main sections.',
        'All sections are scored equally.',
        'You can take the test on computer.',
      ],
      correctFlags: [true, false, true],
    });

    // 9. Summary (Cloze) tasks (2 tasks)
    tasks.push({
      lessonId,
      type: TaskType.SUMMARY_CLOZE,
      order: existingTasksCount + 17,
      title: 'Fill Summary Paragraph',
      description: 'Fill in missing words',
      textTemplate:
        'Climate __1__ is a pressing global issue. Rising __2__ are causing __3__ to melt.',
      wordBank: ['change', 'temperatures', 'ice', 'economy'],
      correctAnswers: new Map([
        ['1', 'change'],
        ['2', 'temperatures'],
        ['3', 'ice'],
      ]),
    });

    tasks.push({
      lessonId,
      type: TaskType.SUMMARY_CLOZE,
      order: existingTasksCount + 18,
      title: 'Complete Summary',
      description: 'Fill in the summary',
      textTemplate:
        'The __1__ of education has __2__ over time. Modern __3__ emphasize critical thinking.',
      wordBank: ['importance', 'evolved', 'educators', 'programs'],
      correctAnswers: new Map([
        ['1', 'importance'],
        ['2', 'evolved'],
        ['3', 'educators'],
      ]),
    });

    // 10. Drag-and-Drop (Categorization) tasks (2 tasks)
    tasks.push({
      lessonId,
      type: TaskType.DRAG_DROP,
      order: existingTasksCount + 19,
      title: 'Categorize Items',
      description: 'Drag items into correct categories',
      categories: ['Fruits', 'Vegetables'],
      items: ['Apple', 'Banana', 'Tomato', 'Carrot'],
      correctMapping: new Map([
        ['Fruits', ['Apple', 'Banana', 'Tomato']],
        ['Vegetables', ['Carrot']],
      ]),
    });

    tasks.push({
      lessonId,
      type: TaskType.DRAG_DROP,
      order: existingTasksCount + 20,
      title: 'Item Classification',
      description: 'Sort items into categories',
      categories: ['Verbs', 'Nouns', 'Adjectives'],
      items: ['running', 'beauty', 'happy', 'writing'],
      correctMapping: new Map([
        ['Verbs', ['running', 'writing']],
        ['Nouns', ['beauty']],
        ['Adjectives', ['happy']],
      ]),
    });

    // 11. Paraphrase tasks (2 tasks)
    tasks.push({
      lessonId,
      type: TaskType.PARAPHRASE,
      order: existingTasksCount + 21,
      title: 'Rewrite the Sentence',
      description: 'Paraphrase this sentence',
      baseSentence: 'The weather is very hot today.',
      modelAnswer: 'Today is extremely warm.',
    });

    tasks.push({
      lessonId,
      type: TaskType.PARAPHRASE,
      order: existingTasksCount + 22,
      title: 'Express Differently',
      description: 'Say it in another way',
      baseSentence: 'She was very happy about the news.',
      modelAnswer: 'She felt extremely joyful when she heard the news.',
    });

    // 12. Sentence Reordering tasks (2 tasks)
    tasks.push({
      lessonId,
      type: TaskType.SENTENCE_REORDERING,
      order: existingTasksCount + 23,
      title: 'Arrange Sentences',
      description: 'Put sentences in correct order',
      segments: [
        'Then, they moved to the living room.',
        'The family sat down for dinner.',
        'Finally, they watched a movie together.',
      ],
      correctOrder: [1, 0, 2],
    });

    tasks.push({
      lessonId,
      type: TaskType.SENTENCE_REORDERING,
      order: existingTasksCount + 24,
      title: 'Logical Sequence',
      description: 'Reorder logically',
      segments: [
        'He studied hard for the exam.',
        'Finally, he passed with distinction.',
        'After months of preparation,',
      ],
      correctOrder: [2, 0, 1],
    });

    // 13. Speaking Part 2 Cue Card tasks (2 tasks)
    tasks.push({
      lessonId,
      type: TaskType.SPEAKING_PART2_CUE_CARD,
      order: existingTasksCount + 25,
      title: 'Describe a Place',
      description: 'Speak for 1-2 minutes',
      cueCardText:
        'Describe a place you would like to visit. You should say: where it is, what you can do there, and why you want to visit it.',
      notesHint: ['Location', 'Activities', 'Reasons'],
      sampleAnswerAudioUrl:
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    });

    tasks.push({
      lessonId,
      type: TaskType.SPEAKING_PART2_CUE_CARD,
      order: existingTasksCount + 26,
      title: 'Describe a Person',
      description: 'Speaking task',
      cueCardText:
        'Describe someone you admire. You should say: who they are, when you met them, and what you admire about them.',
      notesHint: ['Identity', 'Meeting circumstances', 'Qualities'],
      sampleAnswerAudioUrl:
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    });

    // 14. Speaking Part 3 Discussion tasks (2 tasks)
    tasks.push({
      lessonId,
      type: TaskType.SPEAKING_PART3_DISCUSSION,
      order: existingTasksCount + 27,
      title: 'Environmental Issues',
      description: 'Extended discussion',
      questionText:
        'What are the main environmental challenges facing your country?',
      keyPoints: [
        'Air pollution',
        'Water scarcity',
        'Deforestation',
        'Waste management',
      ],
      modelAnswer:
        'My country faces several environmental challenges. The most pressing issues include air pollution from industrial activities and vehicles, water scarcity in rural areas, deforestation due to urban expansion, and inadequate waste management systems. These issues require immediate attention and coordinated efforts.',
    });

    tasks.push({
      lessonId,
      type: TaskType.SPEAKING_PART3_DISCUSSION,
      order: existingTasksCount + 28,
      title: 'Education System',
      description: 'Discuss education',
      questionText: 'How has technology changed education in your country?',
      keyPoints: [
        'Online learning',
        'Digital resources',
        'Accessibility',
        'Challenges',
      ],
      modelAnswer:
        'Technology has significantly transformed education in my country. Online learning platforms have made education more accessible, digital resources have enhanced learning materials, and technology has broken geographical barriers. However, the digital divide remains a challenge for rural areas.',
    });

    // Insert all tasks
    const result = await TaskModel.insertMany(tasks);
    console.log(`\n✅ Successfully created ${result.length} tasks`);
    console.log(
      `📌 Tasks attached to lesson: ${(lesson as any).title} (${lessonId})\n`,
    );

    // Print summary by type
    console.log('📊 Tasks created by type:');
    const tasksByType = tasks.reduce(
      (acc, task) => {
        acc[task.type] = (acc[task.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    Object.entries(tasksByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} tasks`);
    });

    await connection.close();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await connection.close();
    process.exit(1);
  }
}

seed();
