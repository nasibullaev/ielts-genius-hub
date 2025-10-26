import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import { join } from 'path';
import { User } from '../users/schemas/user.schema';
import { UserActivity } from '../users/schemas/user-activity.schema';
import { Course } from '../courses/schemas/course.schema';
import { CourseRating } from '../courses/schemas/course-rating.schema';
import { Unit } from '../courses/schemas/unit.schema';
import { Section } from '../courses/schemas/section.schema';
import { Lesson } from '../lessons/schemas/lesson.schema';
import { QuizQuestion } from '../lessons/schemas/quiz-question.schema';
import { Task } from '../lessons/schemas/task.schema';
import { LevelCheck } from '../level-checker/schemas/level-check.schema';
import { Interest } from './schemas/interest.schema';
import { CreateBulkQuestionsDto } from './dto/bulk-quiz-questions.dto';
import {
  CreateInterestDto,
  UpdateInterestDto,
} from './dto/create-interest.dto';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserActivity.name) private activityModel: Model<UserActivity>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(CourseRating.name) private ratingModel: Model<CourseRating>,
    @InjectModel(LevelCheck.name) private levelCheckModel: Model<LevelCheck>,
    @InjectModel(Unit.name) private unitModel: Model<Unit>, // ✅ Add these
    @InjectModel(Section.name) private sectionModel: Model<Section>,
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(QuizQuestion.name)
    private quizQuestionModel: Model<QuizQuestion>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Interest.name) private interestModel: Model<Interest>,
  ) {}

  // Update the method with explicit typing:
  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total users
    const totalUsers = await this.userModel.countDocuments();

    // Monthly active users
    const monthlyActiveUsers = await this.activityModel
      .distinct('userId', {
        createdAt: { $gte: thirtyDaysAgo },
      })
      .then((users) => users.length);

    // Daily active users
    const dailyActiveUsers = await this.activityModel
      .distinct('userId', {
        createdAt: { $gte: today },
      })
      .then((users) => users.length);

    // Recent activities with proper typing
    const recentActivities = await this.activityModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name')
      .populate('lessonId', 'title')
      .lean<Array<any>>()
      .exec();

    // Course stats
    const courses = await this.courseModel.find().lean();
    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const enrolledUsers = await this.activityModel
          .distinct('userId', {
            courseId: course._id,
          })
          .then((users) => users.length);

        return {
          courseId: course._id,
          title: course.title,
          averageRating: course.rating,
          totalRatings: course.ratingCount,
          enrolledUsers,
        };
      }),
    );

    return {
      totalUsers,
      monthlyActiveUsers,
      dailyActiveUsers,
      recentActivities: recentActivities.map((activity) => ({
        userId: activity.userId?._id || activity.userId,
        userName: activity.userId?.name || 'Unknown User',
        activityType: activity.activityType,
        lessonTitle: activity.lessonId?.title || 'Unknown Lesson',
        score: activity.quizScore || null,
        createdAt: activity.createdAt,
      })),
      courseStats,
    };
  }
  // ========== UNIT METHODS ==========
  async createUnit(createUnitDto) {
    const unit = new this.unitModel(createUnitDto);
    return unit.save();
  }

  async updateUnit(id: string, updateData) {
    return this.unitModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteUnit(id: string) {
    return this.unitModel.findByIdAndDelete(id);
  }

  async getUnitsInCourse(courseId: string) {
    return this.unitModel.find({ courseId }).sort({ order: 1 });
  }

  // ========== SECTION METHODS ==========
  async createSection(createSectionDto) {
    const section = new this.sectionModel(createSectionDto);
    return section.save();
  }

  async updateSection(id: string, updateData) {
    return this.sectionModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteSection(id: string) {
    return this.sectionModel.findByIdAndDelete(id);
  }

  async getSectionsInUnit(unitId: string) {
    return this.sectionModel.find({ unitId }).sort({ order: 1 });
  }

  // ========== LESSON METHODS ==========
  async createLesson(createLessonDto) {
    const lesson = new this.lessonModel(createLessonDto);
    return lesson.save();
  }

  async updateLesson(id: string, updateData) {
    return this.lessonModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteLesson(id: string) {
    return this.lessonModel.findByIdAndDelete(id);
  }

  async getLessonsInSection(sectionId: string) {
    return this.lessonModel.find({ sectionId }).sort({ order: 1 });
  }

  // ========== QUIZ QUESTION METHODS ==========
  async addQuizQuestion(lessonId: string, questionDto) {
    const question = new this.quizQuestionModel({
      ...questionDto,
      lessonId,
    });
    return question.save();
  }
  async addBulkQuizQuestions(
    lessonId: string,
    bulkQuestionsDto: CreateBulkQuestionsDto,
  ) {
    // Check if lesson exists and is a quiz
    const lesson = await this.lessonModel.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    if (lesson.type !== 'Quiz') {
      throw new BadRequestException(
        'Can only add questions to Quiz type lessons',
      );
    }

    // Get the current highest order number for this lesson
    const lastQuestion = await this.quizQuestionModel
      .findOne({ lessonId })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const startingOrder = (lastQuestion?.order || 0) + 1;

    // Prepare questions with correct lesson ID and sequential order
    const questionsToCreate = bulkQuestionsDto.questions.map(
      (questionData, index) => ({
        ...questionData,
        lessonId,
        order: startingOrder + index, // Auto-increment order
      }),
    );

    // Bulk insert all questions
    const createdQuestions =
      await this.quizQuestionModel.insertMany(questionsToCreate);

    return {
      message: `Created ${createdQuestions.length} questions successfully`,
      createdCount: createdQuestions.length,
      questions: createdQuestions.map((q) => ({
        _id: q._id,
        question: q.question,
        order: q.order,
      })),
    };
  }

  async updateQuizQuestion(id: string, updateData) {
    return this.quizQuestionModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }

  async deleteQuizQuestion(id: string) {
    return this.quizQuestionModel.findByIdAndDelete(id);
  }

  async getQuizQuestions(lessonId: string) {
    return this.quizQuestionModel.find({ lessonId }).sort({ order: 1 });
  }

  // ========== INTEREST METHODS ==========
  async createInterest(createInterestDto, iconUrl: string) {
    // Convert string isActive to boolean
    let isActive = true; // default value
    if (createInterestDto.isActive !== undefined) {
      isActive =
        createInterestDto.isActive === 'true' ||
        createInterestDto.isActive === '1';
    }

    const interest = new this.interestModel({
      name: createInterestDto.name,
      icon: iconUrl,
      isActive,
    });
    return interest.save();
  }

  async getAllInterests() {
    return this.interestModel.find().sort({ createdAt: -1 });
  }

  async updateInterest(id: string, updateData, iconUrl?: string) {
    // Convert string isActive to boolean if provided
    let processedUpdateData = { ...updateData };

    if (updateData.isActive !== undefined) {
      processedUpdateData.isActive =
        updateData.isActive === 'true' || updateData.isActive === '1';
    }

    // Add icon URL if provided
    if (iconUrl) {
      processedUpdateData.icon = iconUrl;
    }

    const updatedInterest = await this.interestModel.findByIdAndUpdate(
      id,
      processedUpdateData,
      { new: true },
    );
    if (!updatedInterest) {
      throw new NotFoundException('Interest not found');
    }
    return updatedInterest;
  }

  async deleteInterest(id: string) {
    // Check if any users have selected this interest
    const usersWithInterest = await this.userModel.countDocuments({
      interests: id,
    });

    // if (usersWithInterest > 0) {
    //   throw new BadRequestException(
    //     `Cannot delete interest. ${usersWithInterest} users have selected this interest.`,
    //   );
    // }

    const deletedInterest = await this.interestModel.findByIdAndDelete(id);
    if (!deletedInterest) {
      throw new NotFoundException('Interest not found');
    }

    return { message: 'Interest deleted successfully' };
  }

  // ========== TASK METHODS ==========
  async createTask(createTaskDto: CreateTaskDto) {
    const task = new this.taskModel(createTaskDto);
    return task.save();
  }

  async updateTask(id: string, updateData: UpdateTaskDto) {
    const updatedTask = await this.taskModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedTask) {
      throw new NotFoundException('Task not found');
    }
    return updatedTask;
  }

  async deleteTask(id: string) {
    const deletedTask = await this.taskModel.findByIdAndDelete(id);
    if (!deletedTask) {
      throw new NotFoundException('Task not found');
    }
    return { message: 'Task deleted successfully' };
  }

  async getTasksInLesson(lessonId: string) {
    const lesson = await this.lessonModel.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return this.taskModel.find({ lessonId }).sort({ order: 1 });
  }
}
