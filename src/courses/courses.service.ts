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
          const units = await this.unitModel
            .find({ courseId: course._id.toString() })
            .select('_id')
            .lean();

          const unitIds = units.map((u) => u._id.toString());

          const sectionIds = (
            await this.sectionModel
              .find({ unitId: { $in: unitIds } })
              .select('_id')
              .lean()
          ).map((s) => s._id.toString());

          const totalLessonsCount =
            sectionIds.length > 0
              ? await this.lessonModel.countDocuments({
                  sectionId: { $in: sectionIds },
                })
              : 0;

          return {
            _id: course._id.toString(),
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
            .find({ courseId: course._id.toString() })
            .select('_id')
            .lean()
        ).map((u) => u._id.toString());

        const sectionIds = (
          await this.sectionModel
            .find({ unitId: { $in: unitIds } })
            .select('_id')
            .lean()
        ).map((s) => s._id.toString());

        const totalLessonsCount =
          sectionIds.length > 0
            ? await this.lessonModel.countDocuments({
                sectionId: { $in: sectionIds },
              })
            : 0;

        const progress = await this.progressModel
          .findOne({
            userId: new Types.ObjectId(userId),
            courseId: course._id,
          })
          .lean();

        return {
          _id: course._id.toString(),
          title: course.title,
          description: course.description,
          rating: course.rating,
          duration: course.duration,
          level: course.level,
          picture: course.picture,
          ratingCount: course.ratingCount,
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
    // Find the course first
    const course = await this.courseModel.findById(id).lean().exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Get units for this course
    const units = await this.unitModel
      .find({ courseId: id })
      .sort({ order: 1 })
      .lean()
      .exec();

    const unitIds = units.map((unit) => unit._id.toString());
    const sections = await this.sectionModel
      .find({ unitId: { $in: unitIds } })
      .sort({ order: 1 })
      .lean()
      .exec();

    const sectionIds = sections.map((section) => section._id.toString());
    const lessons = await this.lessonModel
      .find({ sectionId: { $in: sectionIds } })
      .sort({ order: 1 })
      .lean()
      .exec();

    let isPaid = false;
    if (userId) {
      const user = await this.userModel
        .findById(userId)
        .select('isPaid')
        .lean();
      isPaid = !!user?.isPaid;
    }

    const unitsWithSections = units.map((unit) => {
      const unitSections = sections
        .filter((section) => section.unitId.toString() === unit._id.toString())
        .map((section) => ({
          _id: section._id.toString(),
          unitId: section.unitId.toString(),
          title: section.title,
          order: section.order,
          lessons: isPaid
            ? lessons
                .filter(
                  (lesson) =>
                    lesson.sectionId.toString() === section._id.toString(),
                )
                .map((lesson) => ({
                  _id: lesson._id.toString(),
                  sectionId: lesson.sectionId.toString(),
                  title: lesson.title,
                  description: lesson.description,
                  order: lesson.order,
                  type: lesson.type,
                  videoUrl: lesson.videoUrl,
                  textContent: lesson.textContent,
                  fileUrl: lesson.fileUrl,
                  fileName: lesson.fileName,
                }))
            : undefined,
        }));

      return {
        _id: unit._id.toString(),
        courseId: unit.courseId.toString(),
        title: unit.title,
        order: unit.order,
        sections: unitSections,
      };
    });

    const totalLessonsCount = lessons.length;

    const courseWithUnits = {
      _id: course._id.toString(),
      title: course.title,
      description: course.description,
      level: course.level,
      duration: course.duration,
      rating: course.rating,
      ratingCount: course.ratingCount,
      totalRating: course.totalRating,
      picture: course.picture,
      totalLessons: totalLessonsCount,
      units: unitsWithSections,
    };

    if (userId) {
      const progress = await this.progressModel
        .findOne({
          userId: new Types.ObjectId(userId),
          courseId: id,
        })
        .lean();

      return {
        ...courseWithUnits,
        progress: progress
          ? {
              _id: progress._id.toString(),
              userId: progress.userId.toString(),
              courseId: progress.courseId.toString(),
              completedLessons: progress.completedLessons,
              totalLessons: progress.totalLessons,
              progressPercentage: progress.progressPercentage,
              lastAccessed: progress.lastAccessed,
            }
          : null,
      };
    }

    return courseWithUnits;
  }

  async create(
    createCourseDto: CreateCourseDto,
    pictureUrl: string,
  ): Promise<Course> {
    const newCourse = new this.courseModel({
      ...createCourseDto,
      picture: pictureUrl,
    });

    const savedCourse = await newCourse.save();

    return savedCourse;
  }

  async update(
    id: string,
    updateData: Partial<CreateCourseDto>,
    pictureUrl?: string,
  ): Promise<Course> {
    const updatePayload: any = { ...updateData };

    if (pictureUrl) {
      updatePayload.picture = pictureUrl;
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
