// src/lessons/lessons.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson } from './schemas/lesson.schema';
import { QuizQuestion } from './schemas/quiz-question.schema';
import { UserActivity } from '../users/schemas/user-activity.schema';
import { UserProgress } from '../users/schemas/user-progress.schema';
import { User } from '../users/schemas/user.schema';
import { QuizAnswerDto } from './dto/quiz-answer.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(QuizQuestion.name)
    private quizQuestionModel: Model<QuizQuestion>,
    @InjectModel(UserActivity.name) private activityModel: Model<UserActivity>,
    @InjectModel(UserProgress.name) private progressModel: Model<UserProgress>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getLesson(lessonId: string, userId: string) {
    // Check if user has paid access
    const user = await this.userModel.findById(userId);
    if (!user?.isPaid) {
      throw new ForbiddenException('Payment required to access lessons');
    }

    const lesson = await this.lessonModel.findById(lessonId).lean().exec();
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // If it's a quiz, get questions (without correct answers)
    if (lesson.type === 'Quiz') {
      const questions = await this.quizQuestionModel
        .find({ lessonId })
        .select('-correctOptionIndex') // Don't send correct answers
        .sort({ order: 1 })
        .lean();

      return {
        ...lesson,
        questions: questions.map((q) => ({
          _id: q._id,
          question: q.question,
          options: q.options,
          order: q.order,
        })),
      };
    }

    return lesson;
  }

  async submitQuiz(
    lessonId: string,
    userId: string,
    quizAnswers: QuizAnswerDto,
  ) {
    // Check if user has paid access
    const user = await this.userModel.findById(userId);
    if (!user?.isPaid) {
      throw new ForbiddenException('Payment required to access lessons');
    }

    const lesson = await this.lessonModel.findById(lessonId);
    if (!lesson || lesson.type !== 'Quiz') {
      throw new NotFoundException('Quiz not found');
    }

    // Get correct answers
    const questions = await this.quizQuestionModel
      .find({ lessonId })
      .sort({ order: 1 })
      .lean();

    if (questions.length !== quizAnswers.answers.length) {
      throw new ForbiddenException('Invalid number of answers provided');
    }

    // Calculate score
    let correctCount = 0;
    const results = questions.map((question, index) => {
      const userAnswer = quizAnswers.answers[index];
      const isCorrect = userAnswer === question.correctOptionIndex;
      if (isCorrect) correctCount++;

      return {
        questionId: question._id,
        question: question.question,
        options: question.options,
        userAnswer,
        correctAnswer: question.correctOptionIndex,
        isCorrect,
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);

    // Save activity
    await this.saveActivity(
      userId,
      lessonId,
      lesson.sectionId.toString(),
      'quiz_attempted',
      score,
      quizAnswers.answers,
    );

    return {
      score,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      results,
      message: `You scored ${score}% (${correctCount}/${questions.length})`,
    };
  }

  async completeLesson(lessonId: string, userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user?.isPaid) {
      throw new ForbiddenException('Payment required to access lessons');
    }

    const lesson = await this.lessonModel
      .findById(lessonId)
      .populate('sectionId');
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Save completion activity
    await this.saveActivity(
      userId,
      lessonId,
      lesson.sectionId.toString(),
      'completed',
    );

    // Update user streak
    await this.updateUserStreak(userId);

    return { message: 'Lesson completed successfully' };
  }

  private async saveActivity(
    userId: string,
    lessonId: string,
    courseId: string,
    activityType: string,
    quizScore?: number,
    quizAnswers?: number[],
  ) {
    const activity = new this.activityModel({
      userId: new Types.ObjectId(userId),
      lessonId: new Types.ObjectId(lessonId),
      courseId: new Types.ObjectId(courseId),
      activityType,
      quizScore,
      quizAnswers,
    });

    await activity.save();

    // Update course progress
    await this.updateUserProgress(userId, courseId);
  }

  private async updateUserProgress(userId: string, courseId: string) {
    const completedLessonsCount = await this.activityModel.countDocuments({
      userId: new Types.ObjectId(userId),
      courseId: new Types.ObjectId(courseId),
      activityType: { $in: ['completed', 'quiz_attempted'] },
    });

    const totalLessonsCount = await this.lessonModel.countDocuments({
      // You'll need to populate through sections to get courseId
    });

    const progressPercentage =
      totalLessonsCount > 0
        ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
        : 0;

    await this.progressModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        courseId: new Types.ObjectId(courseId),
      },
      {
        completedLessons: completedLessonsCount,
        totalLessons: totalLessonsCount,
        progressPercentage,
        lastAccessed: new Date(),
      },
      { upsert: true, new: true },
    );
  }

  private async updateUserStreak(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastActivity = user.lastActivityDate;

    if (!lastActivity) {
      // First activity
      await this.userModel.findByIdAndUpdate(userId, {
        currentStreak: 1,
        lastActivityDate: new Date(),
      });
    } else {
      const lastActivityDate = new Date(lastActivity);
      lastActivityDate.setHours(0, 0, 0, 0);

      if (lastActivityDate.getTime() === today.getTime()) {
        // Already completed today - no change
        return;
      } else if (lastActivityDate.getTime() === yesterday.getTime()) {
        // Consecutive day - increment streak
        await this.userModel.findByIdAndUpdate(userId, {
          currentStreak: user.currentStreak + 1,
          lastActivityDate: new Date(),
        });
      } else {
        // Streak broken - reset to 1
        await this.userModel.findByIdAndUpdate(userId, {
          currentStreak: 1,
          lastActivityDate: new Date(),
        });
      }
    }
  }
}
