import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LevelCheck } from './schemas/level-check.schema';

@Injectable()
export class LevelCheckerService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    @InjectModel(LevelCheck.name) private levelCheckModel: Model<LevelCheck>,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateWritingTopic(): Promise<{ topic: string }> {
    try {
      const prompt = `You are an IELTS Writing Task 2 topic generator. Generate a challenging but fair IELTS Academic Writing Task 2 topic. 

The topic should be:
- About 250-300 words minimum requirement
- Cover common IELTS themes (education, technology, environment, society, etc.)
- Be clear and specific
- Follow IELTS Task 2 format exactly

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

  async evaluateEssay(
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
}
