import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson } from './schemas/lesson.schema';
import { QuizQuestion } from './schemas/quiz-question.schema';
import { Task, TaskDocument, TaskType } from './schemas/task.schema';
import { UserActivity } from '../users/schemas/user-activity.schema';
import { UserProgress } from '../users/schemas/user-progress.schema';
import { User } from '../users/schemas/user.schema';
import { Section } from '../courses/schemas/section.schema';
import { Unit } from '../courses/schemas/unit.schema';
import { Course } from '../courses/schemas/course.schema';
import { QuizAnswerDto } from './dto/quiz-answer.dto';
import { TaskBatchSubmissionDto } from './dto/task-submit.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(QuizQuestion.name)
    private quizQuestionModel: Model<QuizQuestion>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(UserActivity.name) private activityModel: Model<UserActivity>,
    @InjectModel(UserProgress.name) private progressModel: Model<UserProgress>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Section.name) private sectionModel: Model<Section>,
    @InjectModel(Unit.name) private unitModel: Model<Unit>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
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

    // Get tasks for this lesson (without correct answers)
    const tasks = await this.taskModel
      .find({ lessonId: new Types.ObjectId(lessonId) })
      .select(
        '-correctOptionIndex -correctOptionIndices -correctPairs -correctOrder -correctAnswers -correctFlags -correctMapping -modelAnswer',
      )
      .sort({ order: 1 })
      .lean();

    return {
      ...lesson,
      tasks: tasks.map((t) => ({
        _id: t._id,
        type: t.type,
        title: t.title,
        description: t.description,
        order: t.order,
        textPrompt: t.textPrompt,
        imageUrl: t.imageUrl,
        audioUrl: t.audioUrl,
        options: t.options,
        promptText: t.promptText,
        maxDuration: t.maxDuration,
        sampleAnswerAudioUrl: t.sampleAnswerAudioUrl,
        pairs: t.pairs,
        items: t.items,
        textTemplate: t.textTemplate,
        wordBank: t.wordBank,
        statements: t.statements,
        categories: t.categories,
        segments: t.segments,
        baseSentence: t.baseSentence,
        cueCardText: t.cueCardText,
        notesHint: t.notesHint,
        questionText: t.questionText,
        keyPoints: t.keyPoints,
      })),
    };
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
    // Resolve courseId from section -> unit -> course
    const section = await this.sectionModel.findById(lesson.sectionId).lean();
    const unit = section
      ? await this.unitModel.findById(section.unitId).lean()
      : null;
    const courseId = unit ? unit.courseId.toString() : undefined;

    await this.saveActivity(
      userId,
      lessonId,
      courseId!,
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

    const lesson = await this.lessonModel.findById(lessonId).lean();
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Save completion activity
    // Resolve courseId
    const section = await this.sectionModel.findById(lesson.sectionId).lean();
    const unit = section
      ? await this.unitModel.findById(section.unitId).lean()
      : null;
    const courseId = unit ? unit.courseId.toString() : undefined;

    await this.saveActivity(userId, lessonId, courseId!, 'completed');

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

    // Count lessons belong to this courseId via section -> unit -> course
    const unitIds = (
      await this.unitModel
        .find({ courseId: new Types.ObjectId(courseId) })
        .select('_id')
        .lean()
    ).map((u) => u._id);
    const sectionIds = (
      await this.sectionModel
        .find({ unitId: { $in: unitIds } })
        .select('_id')
        .lean()
    ).map((s) => s._id);
    const totalLessonsCount = await this.lessonModel.countDocuments({
      sectionId: { $in: sectionIds },
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

  async submitTasks(
    lessonId: string,
    userId: string,
    taskSubmissions: TaskBatchSubmissionDto,
  ) {
    // Check if user has paid access
    const user = await this.userModel.findById(userId);
    if (!user?.isPaid) {
      throw new ForbiddenException('Payment required to access lessons');
    }

    const lesson = await this.lessonModel.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Get all tasks for this lesson
    const tasks = await this.taskModel
      .find({ lessonId: new Types.ObjectId(lessonId) })
      .sort({ order: 1 })
      .lean();

    if (tasks.length !== taskSubmissions.submissions.length) {
      throw new ForbiddenException('Invalid number of task submissions');
    }

    // Evaluate each task
    const results: Array<{
      taskId: any;
      type: TaskType;
      isCorrect: boolean;
      score: number;
      feedback: string;
    }> = [];
    let totalCorrect = 0;
    let totalQuestions = 0;

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const submission = taskSubmissions.submissions.find(
        (s) => s.taskId === task._id.toString(),
      );

      if (!submission) {
        throw new ForbiddenException(`Missing submission for task ${task._id}`);
      }

      const evaluation = this.evaluateTask(task, submission.submission);
      results.push({
        taskId: task._id,
        type: task.type,
        isCorrect: evaluation.isCorrect,
        score: evaluation.score,
        feedback: evaluation.feedback,
      });

      if (evaluation.hasScore) {
        totalQuestions++;
        if (evaluation.isCorrect) totalCorrect++;
      }
    }

    const overallScore =
      totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : null;

    // Save activity
    const section = await this.sectionModel.findById(lesson.sectionId).lean();
    const unit = section
      ? await this.unitModel.findById(section.unitId).lean()
      : null;
    const courseId = unit ? unit.courseId.toString() : undefined;

    await this.saveActivity(
      userId,
      lessonId,
      courseId!,
      'tasks_attempted',
      overallScore || undefined,
      undefined,
    );

    return {
      overallScore,
      correctAnswers: totalCorrect,
      totalQuestions,
      results,
      message:
        overallScore !== null
          ? `You scored ${overallScore}% (${totalCorrect}/${totalQuestions})`
          : 'Tasks submitted successfully',
    };
  }

  private evaluateTask(
    task: any,
    submission: any,
  ): {
    isCorrect: boolean;
    score: number;
    feedback: string;
    hasScore: boolean;
  } {
    switch (task.type) {
      case TaskType.LISTENING_MCQ:
      case TaskType.MULTIPLE_CHOICE:
        return this.evaluateMultipleChoice(task, submission);

      case TaskType.MATCHING:
        return this.evaluateMatching(task, submission);

      case TaskType.RANKING:
        return this.evaluateRanking(task, submission);

      case TaskType.FILL_IN_BLANK:
      case TaskType.SUMMARY_CLOZE:
        return this.evaluateFillInBlank(task, submission);

      case TaskType.TRUE_FALSE:
        return this.evaluateTrueFalse(task, submission);

      case TaskType.DRAG_DROP:
        return this.evaluateDragDrop(task, submission);

      case TaskType.PARAPHRASE:
        return this.evaluateParaphrase(task, submission);

      case TaskType.SENTENCE_REORDERING:
        return this.evaluateSentenceReordering(task, submission);

      case TaskType.LEAD_IN:
      case TaskType.RECORDING:
      case TaskType.SPEAKING_PART2_CUE_CARD:
      case TaskType.SPEAKING_PART3_DISCUSSION:
        // These don't have automatic scoring
        return {
          isCorrect: true,
          score: 100,
          feedback: 'Task completed',
          hasScore: false,
        };

      default:
        return {
          isCorrect: true,
          score: 100,
          feedback: 'Task completed',
          hasScore: false,
        };
    }
  }

  private evaluateMultipleChoice(
    task: any,
    submission: any,
  ): {
    isCorrect: boolean;
    score: number;
    feedback: string;
    hasScore: boolean;
  } {
    const isCorrect =
      task.type === TaskType.MULTIPLE_CHOICE
        ? this.arraysEqual(
            submission.selectedOptions || [],
            task.correctOptionIndices || [],
          )
        : submission.selectedOption === task.correctOptionIndex;

    return {
      isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect ? 'Correct!' : 'Incorrect. Try again.',
      hasScore: true,
    };
  }

  private evaluateMatching(
    task: any,
    submission: any,
  ): {
    isCorrect: boolean;
    score: number;
    feedback: string;
    hasScore: boolean;
  } {
    const userPairs = submission.pairs || [];
    const correctPairs = task.correctPairs || [];

    let correctCount = 0;
    const totalPairs = correctPairs.length;

    for (const userPair of userPairs) {
      const isMatch = correctPairs.some(
        (cp: any) =>
          cp.leftIndex === userPair[0] && cp.rightIndex === userPair[1],
      );
      if (isMatch) correctCount++;
    }

    const score =
      totalPairs > 0 ? Math.round((correctCount / totalPairs) * 100) : 0;
    const isCorrect = correctCount === totalPairs;

    return {
      isCorrect,
      score,
      feedback: `Matched ${correctCount}/${totalPairs} pairs correctly`,
      hasScore: true,
    };
  }

  private evaluateRanking(
    task: any,
    submission: any,
  ): {
    isCorrect: boolean;
    score: number;
    feedback: string;
    hasScore: boolean;
  } {
    const userOrder = submission.order || [];
    const correctOrder = task.correctOrder || [];
    const isCorrect = this.arraysEqual(userOrder, correctOrder);

    return {
      isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect ? 'Correct ranking!' : 'Incorrect order',
      hasScore: true,
    };
  }

  private evaluateFillInBlank(
    task: any,
    submission: any,
  ): {
    isCorrect: boolean;
    score: number;
    feedback: string;
    hasScore: boolean;
  } {
    const userAnswers = submission.answers || {};
    const correctAnswers = task.correctAnswers || {};

    let correctCount = 0;
    let totalBlanks = 0;

    for (const [key, value] of Object.entries(correctAnswers)) {
      totalBlanks++;
      const userValue = userAnswers[key];
      const correctValue = value;
      if (
        typeof userValue === 'string' &&
        typeof correctValue === 'string' &&
        userValue.toLowerCase() === correctValue.toLowerCase()
      ) {
        correctCount++;
      }
    }

    const score =
      totalBlanks > 0 ? Math.round((correctCount / totalBlanks) * 100) : 0;
    const isCorrect = correctCount === totalBlanks;

    return {
      isCorrect,
      score,
      feedback: `Filled ${correctCount}/${totalBlanks} blanks correctly`,
      hasScore: true,
    };
  }

  private evaluateTrueFalse(
    task: any,
    submission: any,
  ): {
    isCorrect: boolean;
    score: number;
    feedback: string;
    hasScore: boolean;
  } {
    const userAnswers = submission.answers || [];
    const correctAnswers = task.correctFlags || [];

    let correctCount = 0;
    for (
      let i = 0;
      i < Math.min(userAnswers.length, correctAnswers.length);
      i++
    ) {
      if (userAnswers[i] === correctAnswers[i]) {
        correctCount++;
      }
    }

    const total = correctAnswers.length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const isCorrect = correctCount === total;

    return {
      isCorrect,
      score,
      feedback: `Answered ${correctCount}/${total} correctly`,
      hasScore: true,
    };
  }

  private evaluateDragDrop(
    task: any,
    submission: any,
  ): {
    isCorrect: boolean;
    score: number;
    feedback: string;
    hasScore: boolean;
  } {
    const userMapping = submission.mapping || {};
    const correctMapping = task.correctMapping || {};

    let correctItems = 0;
    let totalItems = 0;

    for (const [category, correctItems_array] of Object.entries(
      correctMapping,
    )) {
      const userItems = userMapping[category] || [];
      correctItems += (correctMapping[category] || []).length;

      for (const item of userItems) {
        if (correctMapping[category]?.includes(item)) {
          totalItems++;
        }
      }
    }

    const score =
      correctItems > 0 ? Math.round((totalItems / correctItems) * 100) : 0;
    const isCorrect = totalItems === correctItems;

    return {
      isCorrect,
      score,
      feedback: `Categorized ${totalItems}/${correctItems} items correctly`,
      hasScore: true,
    };
  }

  private evaluateParaphrase(
    task: any,
    submission: any,
  ): {
    isCorrect: boolean;
    score: number;
    feedback: string;
    hasScore: boolean;
  } {
    // Paraphrase tasks typically require manual review or advanced NLP
    // For now, just return as completed
    return {
      isCorrect: true,
      score: 100,
      feedback: 'Your answer has been submitted for review',
      hasScore: false,
    };
  }

  private evaluateSentenceReordering(
    task: any,
    submission: any,
  ): {
    isCorrect: boolean;
    score: number;
    feedback: string;
    hasScore: boolean;
  } {
    const userOrder = submission.order || [];
    const correctOrder = task.correctOrder || [];
    const isCorrect = this.arraysEqual(userOrder, correctOrder);

    return {
      isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect ? 'Correct order!' : 'Incorrect order',
      hasScore: true,
    };
  }

  private arraysEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}
