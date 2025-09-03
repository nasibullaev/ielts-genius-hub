import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course } from './schemas/course.schema';
import { Unit } from './schemas/unit.schema';
import { Section } from './schemas/section.schema';
import { Lesson } from '../lessons/schemas/lesson.schema';
import { CourseRating } from './schemas/course-rating.schema';
import { UserProgress } from '../users/schemas/user-progress.schema';
import { User } from '../users/schemas/user.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { RateCourseDto } from './dto/rate-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Unit.name) private unitModel: Model<Unit>,
    @InjectModel(Section.name) private sectionModel: Model<Section>,
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(CourseRating.name) private ratingModel: Model<CourseRating>,
    @InjectModel(UserProgress.name) private progressModel: Model<UserProgress>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // Public - get all courses (for visitors and users)
  async findAll(userId?: string) {
    const courses = await this.courseModel.find().lean().exec();

    if (!userId) {
      // For visitors - return basic course info only (with dynamic totalLessons)
      const results = await Promise.all(
        courses.map(async (course) => {
          const unitIds = (
            await this.unitModel
              .find({ courseId: course._id })
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

          return {
            _id: course._id,
            title: course.title,
            description: course.description,
            rating: course.rating,
            duration: course.duration,
            totalLessons: totalLessonsCount,
            level: course.level,
            picture: course.picture,
            ratingCount: course.ratingCount,
          };
        }),
      );
      return results;
    }

    // For authenticated users - include progress
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        // Dynamically compute total lessons for the course
        const unitIds = (
          await this.unitModel
            .find({ courseId: course._id })
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

        const progress = await this.progressModel
          .findOne({
            userId: new Types.ObjectId(userId),
            courseId: course._id,
          })
          .lean();

        return {
          ...course,
          totalLessons: totalLessonsCount,
          progress: progress
            ? {
                completedLessons: progress.completedLessons,
                totalLessons: progress.totalLessons,
                progressPercentage: progress.progressPercentage,
                lastAccessed: progress.lastAccessed,
              }
            : null,
        };
      }),
    );

    return coursesWithProgress;
  }

  async findOne(id: string, userId?: string) {
    const course = await this.courseModel
      .findById(id)
      .populate({
        path: 'units',
        options: { sort: { order: 1 } },
        populate: {
          path: 'sections',
          options: { sort: { order: 1 } },
          populate: { path: 'lessons', options: { sort: { order: 1 } } },
        },
      })
      .lean({ virtuals: true })
      .exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Compute total lessons from populated data
    const units = (course as any)?.units || [];
    let totalLessonsCount = units.reduce((acc: number, unit: any) => {
      const sections = unit.sections || [];
      const lessonsInUnit = sections.reduce(
        (sAcc: number, section: any) => sAcc + (section.lessons || []).length,
        0,
      );
      return acc + lessonsInUnit;
    }, 0);

    // Fallback: if population missed lessons, compute via direct counts
    if (!totalLessonsCount) {
      const unitIds = (
        await this.unitModel.find({ courseId: id }).select('_id').lean()
      ).map((u) => u._id);
      const sectionIds = (
        await this.sectionModel
          .find({ unitId: { $in: unitIds } })
          .select('_id')
          .lean()
      ).map((s) => s._id);
      totalLessonsCount = await this.lessonModel.countDocuments({
        sectionId: { $in: sectionIds },
      });
    }

    // If user is paid, include lessons within sections
    let isPaid = false;
    if (userId) {
      const user = await this.userModel
        .findById(userId)
        .select('isPaid')
        .lean();
      isPaid = !!user?.isPaid;
    }

    const courseWithUnits = {
      ...course,
      totalLessons: totalLessonsCount,
      units: isPaid
        ? units
        : units.map((unit: any) => ({
            ...unit,
            sections: (unit.sections || []).map((s: any) => ({
              ...s,
              lessons: undefined,
            })),
          })),
    } as any;

    // Add progress if user is authenticated
    if (userId) {
      const progress = await this.progressModel
        .findOne({
          userId: new Types.ObjectId(userId),
          courseId: id,
        })
        .lean();

      return {
        ...courseWithUnits,
        progress: progress || null,
      };
    }

    return courseWithUnits;
  }

  async create(
    createCourseDto: CreateCourseDto,
    pictureUrl: string,
  ): Promise<Course> {
    console.log('Creating course with picture URL:', pictureUrl);
    console.log('Current working directory:', process.cwd());

    const newCourse = new this.courseModel({
      ...createCourseDto,
      picture: pictureUrl,
    });

    const savedCourse = await newCourse.save();
    console.log('Course saved with picture:', savedCourse.picture);

    return savedCourse;
  }

  async update(
    id: string,
    updateData: Partial<CreateCourseDto>,
    pictureUrl?: string,
  ): Promise<Course> {
    const updatePayload: any = { ...updateData }; // ✅ Use 'any' type

    if (pictureUrl) {
      updatePayload.picture = pictureUrl; // ✅ Now this works
    }

    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .lean()
      .exec();

    if (!updatedCourse) {
      throw new NotFoundException('Course not found');
    }

    return updatedCourse;
  }

  async remove(id: string): Promise<void> {
    const result = await this.courseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Course not found');
    }
  }

  // Course rating
  async rateCourse(userId: string, courseId: string, rateDto: RateCourseDto) {
    // Check if user already rated this course
    const existingRating = await this.ratingModel.findOne({
      userId: new Types.ObjectId(userId),
      courseId: new Types.ObjectId(courseId),
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rateDto.rating;
      existingRating.review = rateDto.review;
      await existingRating.save();
    } else {
      // Create new rating
      const newRating = new this.ratingModel({
        userId: new Types.ObjectId(userId),
        courseId: new Types.ObjectId(courseId),
        rating: rateDto.rating,
        review: rateDto.review,
      });
      await newRating.save();
    }

    // Update course average rating
    await this.updateCourseRating(courseId);

    return { message: 'Course rated successfully' };
  }

  private async updateCourseRating(courseId: string) {
    const ratings = await this.ratingModel.find({ courseId }).lean();
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const avgRating = ratings.length > 0 ? totalRating / ratings.length : 0;

    await this.courseModel.findByIdAndUpdate(courseId, {
      rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      ratingCount: ratings.length,
      totalRating: totalRating,
    });
  }
}
