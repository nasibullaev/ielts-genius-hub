import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { UserActivity } from '../users/schemas/user-activity.schema';
import { Course } from '../courses/schemas/course.schema';
import { CourseRating } from '../courses/schemas/course-rating.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserActivity.name) private activityModel: Model<UserActivity>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(CourseRating.name) private ratingModel: Model<CourseRating>,
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
}
