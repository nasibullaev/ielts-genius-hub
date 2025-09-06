import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LevelCheck } from './schemas/level-check.schema';
import { User } from '../users/schemas/user.schema';
import { WritingTask1 } from './schemas/writing-task1.schema';
import { ListeningTest, ListeningSubmission } from './schemas/listening.schema';
import { ChartGenerationService } from './services/chart-generation.service';

@Injectable()
export class LevelCheckerService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    @InjectModel(LevelCheck.name) private levelCheckModel: Model<LevelCheck>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(WritingTask1.name)
    private writingTask1Model: Model<WritingTask1>,
    @InjectModel(ListeningTest.name)
    private listeningTestModel: Model<ListeningTest>,
    @InjectModel(ListeningSubmission.name)
    private listeningSubmissionModel: Model<ListeningSubmission>,
    private chartGenerationService: ChartGenerationService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateWritingTask2Topic(userId: string): Promise<{ topic: string }> {
    try {
      // Fetch user interests
      const user = await this.userModel
        .findById(userId)
        .select('interests')
        .lean()
        .exec();
      const userInterests = user?.interests
        ? user.interests.map((interest) => interest.toString())
        : ['technology', 'education', 'health', 'environment'];

      const prompt = `You are an IELTS Writing Task 2 topic generator. Generate a challenging but fair IELTS Academic Writing Task 2 topic based on the user's interests.

User Interests: ${userInterests.length > 0 ? userInterests.join(', ') : 'General topics'}

The topic should:
- Be about 50-100 words (shorter than typical Task 2)
- Cover themes related to the user's interests: ${userInterests.length > 0 ? userInterests.join(', ') : 'general topics'}
- Be clear and specific
- Follow IELTS Task 2 format exactly
- Be personalized to the user's interests when possible

Return ONLY the topic question, nothing else.`;

      const result = await this.model.generateContent(prompt);
      const topic = result.response.text().trim();

      if (!topic) {
        throw new BadRequestException('Failed to generate topic');
      }

      return { topic };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new BadRequestException('Failed to generate writing topic');
    }
  }

  async evaluateWritingTask2Essay(
    userId: string,
    topic: string,
    essay: string,
    timeSpent: number,
  ): Promise<{
    overallBand: string;
    taskAchievement: string;
    coherenceCohesion: string;
    lexicalResource: string;
    grammaticalRange: string;
    feedback: string;
    suggestions: string[];
    wordCount: number;
    submissionId: string;
  }> {
    try {
      // Count words
      const wordCount = essay.trim().split(/\s+/).length;

      const prompt = `You are an experienced IELTS Writing examiner. Evaluate this IELTS Writing Task 2 essay based on the official IELTS band descriptors.

Word count: ${wordCount} words

Provide scores (1-9 band scale) for:
1. Task Achievement (TR)
2. Coherence and Cohesion (CC) 
3. Lexical Resource (LR)
4. Grammatical Range and Accuracy (GRA)
5. Overall Band Score

Topic: ${topic}

Essay: ${essay}

Return your response in this EXACT JSON format (no additional text):
{
  "overallBand": "6.5",
  "taskAchievement": "6",
  "coherenceCohesion": "7", 
  "lexicalResource": "6",
  "grammaticalRange": "7",
  "feedback": "Overall feedback paragraph here",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim();

      if (!response) {
        throw new BadRequestException('Failed to evaluate essay');
      }

      try {
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const evaluation = JSON.parse(cleanResponse);

        // Save to database
        const levelCheck = new this.levelCheckModel({
          userId: new Types.ObjectId(userId),
          topic,
          essay,
          overallBand: evaluation.overallBand,
          taskAchievement: evaluation.taskAchievement,
          coherenceCohesion: evaluation.coherenceCohesion,
          lexicalResource: evaluation.lexicalResource,
          grammaticalRange: evaluation.grammaticalRange,
          feedback: evaluation.feedback,
          suggestions: evaluation.suggestions,
          wordCount,
          timeSpent,
        });

        const savedSubmission = await levelCheck.save();

        return {
          ...evaluation,
          wordCount,
          submissionId: savedSubmission._id.toString(),
        };
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', response);
        throw new BadRequestException('Invalid response format from AI');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new BadRequestException('Failed to evaluate essay');
    }
  }

  // For admin dashboard
  async getRecentSubmissions(limit: number = 20) {
    return this.levelCheckModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email')
      .lean()
      .exec();
  }

  async getSubmissionById(id: string) {
    return this.levelCheckModel
      .findById(id)
      .populate('userId', 'name email phone')
      .lean()
      .exec();
  }

  async getUserSubmissions(userId: string) {
    return this.levelCheckModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .select('-essay -feedback -suggestions') // Hide detailed content
      .lean()
      .exec();
  }

  // Writing Task 1 methods
  async generateWritingTask1Topic(userId: string): Promise<{
    question: string;
    imageUrl: string;
    taskType: string;
    dataDescription: string;
  }> {
    try {
      // Fetch user interests
      const user = await this.userModel
        .findById(userId)
        .select('interests')
        .lean()
        .exec();
      const userInterests = user?.interests
        ? user.interests.map((interest) => interest.toString())
        : ['technology', 'education', 'health', 'environment'];

      // Generate a random chart type
      const chartTypes = ['bar_chart', 'line_graph', 'pie_chart'];
      const randomType =
        chartTypes[Math.floor(Math.random() * chartTypes.length)];

      let generatedChart;
      let taskType;

      switch (randomType) {
        case 'bar_chart':
          generatedChart =
            await this.chartGenerationService.generateBarChart(userInterests);
          taskType = 'bar_chart';
          break;
        case 'line_graph':
          generatedChart =
            await this.chartGenerationService.generateLineChart(userInterests);
          taskType = 'line_graph';
          break;
        case 'pie_chart':
          generatedChart =
            await this.chartGenerationService.generatePieChart(userInterests);
          taskType = 'pie_chart';
          break;
        default:
          generatedChart =
            await this.chartGenerationService.generateBarChart(userInterests);
          taskType = 'bar_chart';
      }

      // Generate the question using AI
      const prompt = `You are an IELTS Writing Task 1 question generator. Generate a clear and specific question for describing the following chart:

Chart Type: ${taskType}
Data Description: ${generatedChart.dataDescription}
User Interests: ${userInterests.length > 0 ? userInterests.join(', ') : 'General topics'}

The question should:
- Be clear and specific
- Follow IELTS Task 1 format exactly
- Ask the student to describe the chart
- Specify 50-100 words requirement (shorter than typical Task 1)
- Include the time limit (20 minutes)
- Be appropriate for academic writing
- Reference the user's interests when relevant (${userInterests.length > 0 ? userInterests.join(', ') : 'general topics'})

Return ONLY the question, nothing else.`;

      const result = await this.model.generateContent(prompt);
      const question = result.response.text().trim();

      if (!question) {
        throw new BadRequestException('Failed to generate question');
      }

      return {
        question,
        imageUrl: generatedChart.imageUrl,
        taskType,
        dataDescription: generatedChart.dataDescription,
      };
    } catch (error) {
      console.error('Chart generation error:', error);
      throw new BadRequestException('Failed to generate Writing Task 1 topic');
    }
  }

  async evaluateWritingTask1Essay(
    userId: string,
    question: string,
    imageUrl: string,
    taskType: string,
    answer: string,
    timeSpent: number,
  ): Promise<{
    overallBand: string;
    taskAchievement: string;
    coherenceCohesion: string;
    lexicalResource: string;
    grammaticalRange: string;
    feedback: string;
    suggestions: string[];
    wordCount: number;
    submissionId: string;
  }> {
    try {
      const wordCount = answer.trim().split(/\s+/).length;

      const prompt = `You are an experienced IELTS Writing Task 1 examiner. Evaluate this IELTS Writing Task 1 response based on the official IELTS band descriptors.

Word count: ${wordCount} words (Target: 50-100 words)
Task Type: ${taskType}
Question: ${question}

Response: ${answer}

Provide scores (1-9 band scale) for:
1. Task Achievement (TR) - How well the task is completed
2. Coherence and Cohesion (CC) - Organization and linking
3. Lexical Resource (LR) - Vocabulary range and accuracy
4. Grammatical Range and Accuracy (GRA) - Grammar variety and accuracy
5. Overall Band Score

Return your response in this EXACT JSON format (no additional text):
{
  "overallBand": "6.5",
  "taskAchievement": "6",
  "coherenceCohesion": "7", 
  "lexicalResource": "6",
  "grammaticalRange": "7",
  "feedback": "Overall feedback paragraph here",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim();

      if (!response) {
        throw new BadRequestException('Failed to evaluate response');
      }

      try {
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const evaluation = JSON.parse(cleanResponse);

        // Save to database
        const writingTask1 = new this.writingTask1Model({
          userId: new Types.ObjectId(userId),
          question,
          imageUrl,
          imagePrompt: `Generated ${taskType} chart`,
          taskType,
          dataDescription: `Chart data for ${taskType}`,
          chartData: {},
          answer,
          overallBand: evaluation.overallBand,
          taskAchievement: evaluation.taskAchievement,
          coherenceCohesion: evaluation.coherenceCohesion,
          lexicalResource: evaluation.lexicalResource,
          grammaticalRange: evaluation.grammaticalRange,
          feedback: evaluation.feedback,
          suggestions: evaluation.suggestions,
          wordCount,
          timeSpent,
        });

        const savedSubmission = await writingTask1.save();

        return {
          ...evaluation,
          wordCount,
          submissionId: (savedSubmission._id as Types.ObjectId).toString(),
        };
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', response);
        throw new BadRequestException('Invalid response format from AI');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new BadRequestException('Failed to evaluate response');
    }
  }

  // Listening methods
  async generateListeningTopic(userId: string): Promise<{
    testId: string;
    listeningText: string;
    questions: Array<{
      question: string;
      questionType: string;
      options?: string[];
    }>;
  }> {
    try {
      // Fetch user interests
      const user = await this.userModel
        .findById(userId)
        .select('interests')
        .lean()
        .exec();
      const userInterests = user?.interests
        ? user.interests.map((interest) => interest.toString())
        : ['technology', 'education', 'health', 'environment'];

      const prompt = `You are an IELTS Listening test generator. Generate a listening text and questions based on the user's interests.

User Interests: ${userInterests.length > 0 ? userInterests.join(', ') : 'General topics'}

Generate:
1. A listening text (200-300 words) about topics related to: ${userInterests.length > 0 ? userInterests.join(', ') : 'general topics'}
2. 10 questions with the following types:
   - 3 True/False/Not Given questions
   - 4 Multiple Choice questions (A, B, C, D)
   - 3 Input Text questions (fill in the missing word)

The listening text should be:
- Academic in nature
- Clear and well-structured
- Appropriate for IELTS level
- Related to the user's interests when possible

For each question, provide:
- The question text
- Question type (true_false_not_given, multiple_choice, input_text)
- Options (for multiple choice and true/false)
- Correct answer
- Explanation

Return your response in this EXACT JSON format (no additional text):
{
  "listeningText": "Your listening text here...",
  "questions": [
    {
      "question": "Question text here",
      "questionType": "true_false_not_given",
      "options": ["True", "False", "Not Given"],
      "correctAnswer": "True",
      "explanation": "Explanation here"
    },
    {
      "question": "Question text here",
      "questionType": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B",
      "explanation": "Explanation here"
    },
    {
      "question": "Complete the sentence: The main topic discussed is _____",
      "questionType": "input_text",
      "correctAnswer": "climate change",
      "explanation": "The text clearly states that climate change is the main topic"
    }
  ]
}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim();

      if (!response) {
        throw new BadRequestException('Failed to generate listening content');
      }

      try {
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const listeningContent = JSON.parse(cleanResponse);

        // Validate the response structure
        if (!listeningContent.listeningText || !listeningContent.questions) {
          throw new BadRequestException('Invalid response format from AI');
        }

        // Generate unique test ID
        const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Save the test to database (with correct answers)
        const listeningTest = new this.listeningTestModel({
          listeningText: listeningContent.listeningText,
          questions: listeningContent.questions,
          testId,
        });

        await listeningTest.save();

        // Return test without correct answers
        const questionsWithoutAnswers = listeningContent.questions.map(
          (q: any) => ({
            question: q.question,
            questionType: q.questionType,
            options: q.options,
          }),
        );

        return {
          testId,
          listeningText: listeningContent.listeningText,
          questions: questionsWithoutAnswers,
        };
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', response);
        throw new BadRequestException('Invalid response format from AI');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new BadRequestException('Failed to generate listening content');
    }
  }

  async evaluateListeningAnswers(
    userId: string,
    testId: string,
    userAnswers: string[],
    timeSpent: string,
  ): Promise<{
    overallBand: string;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    detailedResults: Array<{
      questionIndex: number;
      question: string;
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      explanation: string;
    }>;
    feedback: string;
    suggestions: string[];
    submissionId: string;
  }> {
    try {
      // Find the listening test by testId
      const listeningTest = await this.listeningTestModel.findOne({ testId });
      if (!listeningTest) {
        throw new BadRequestException('Listening test not found');
      }

      // Check answers against correct answers
      const detailedResults = listeningTest.questions.map((question, index) => {
        const userAnswer = userAnswers[index] || '';
        const isCorrect = this.compareAnswers(
          userAnswer,
          question.correctAnswer,
        );

        return {
          questionIndex: index,
          question: question.question,
          userAnswer: userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect: isCorrect,
          explanation: question.explanation,
        };
      });

      const correctAnswers = detailedResults.filter(
        (result) => result.isCorrect,
      ).length;
      const totalQuestions = listeningTest.questions.length;
      const percentage = Math.round((correctAnswers / totalQuestions) * 100);

      // Calculate band score based on percentage
      const overallBand = this.calculateBandScore(percentage);

      // Generate feedback and suggestions
      const feedback = this.generateListeningFeedback(
        correctAnswers,
        totalQuestions,
        percentage,
      );
      const suggestions = this.generateListeningSuggestions(detailedResults);

      // Save submission to database
      const listeningSubmission = new this.listeningSubmissionModel({
        userId: new Types.ObjectId(userId),
        testId,
        userAnswers,
        overallBand,
        correctAnswers,
        totalQuestions,
        percentage,
        detailedResults,
        feedback,
        suggestions,
        timeSpent,
      });

      const savedSubmission = await listeningSubmission.save();

      return {
        overallBand,
        correctAnswers,
        totalQuestions,
        percentage,
        detailedResults,
        feedback,
        suggestions,
        submissionId: (savedSubmission._id as Types.ObjectId).toString(),
      };
    } catch (error) {
      console.error('Error evaluating listening answers:', error);
      throw new BadRequestException('Failed to evaluate listening answers');
    }
  }

  private compareAnswers(userAnswer: string, correctAnswer: string): boolean {
    // Normalize answers for comparison
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = correctAnswer.trim().toLowerCase();

    return normalizedUserAnswer === normalizedCorrectAnswer;
  }

  private calculateBandScore(percentage: number): string {
    if (percentage >= 90) return '9.0';
    if (percentage >= 85) return '8.5';
    if (percentage >= 80) return '8.0';
    if (percentage >= 75) return '7.5';
    if (percentage >= 70) return '7.0';
    if (percentage >= 65) return '6.5';
    if (percentage >= 60) return '6.0';
    if (percentage >= 55) return '5.5';
    if (percentage >= 50) return '5.0';
    if (percentage >= 45) return '4.5';
    if (percentage >= 40) return '4.0';
    if (percentage >= 35) return '3.5';
    if (percentage >= 30) return '3.0';
    if (percentage >= 25) return '2.5';
    if (percentage >= 20) return '2.0';
    if (percentage >= 15) return '1.5';
    if (percentage >= 10) return '1.0';
    return '0.5';
  }

  private generateListeningFeedback(
    correctAnswers: number,
    totalQuestions: number,
    percentage: number,
  ): string {
    if (percentage >= 80) {
      return `Excellent performance! You answered ${correctAnswers} out of ${totalQuestions} questions correctly (${percentage}%). This demonstrates strong listening comprehension skills.`;
    } else if (percentage >= 60) {
      return `Good performance! You answered ${correctAnswers} out of ${totalQuestions} questions correctly (${percentage}%). You're on the right track with your listening skills.`;
    } else if (percentage >= 40) {
      return `Fair performance. You answered ${correctAnswers} out of ${totalQuestions} questions correctly (${percentage}%). Focus on improving your listening comprehension.`;
    } else {
      return `Needs improvement. You answered ${correctAnswers} out of ${totalQuestions} questions correctly (${percentage}%). Consider practicing more with listening exercises.`;
    }
  }

  private generateListeningSuggestions(
    detailedResults: Array<{ isCorrect: boolean; question: string }>,
  ): string[] {
    const suggestions: string[] = [];
    const incorrectCount = detailedResults.filter(
      (result) => !result.isCorrect,
    ).length;

    if (incorrectCount > 0) {
      suggestions.push(
        'Practice listening for specific details and main ideas',
      );
      suggestions.push('Work on note-taking skills while listening');
      suggestions.push('Practice with different accents and speaking speeds');
    }

    if (incorrectCount > 5) {
      suggestions.push('Focus on improving vocabulary recognition');
      suggestions.push(
        'Practice listening to academic lectures and discussions',
      );
    }

    return suggestions.length > 0
      ? suggestions
      : ['Keep practicing to maintain your current level'];
  }
}
