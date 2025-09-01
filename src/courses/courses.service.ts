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
import { CourseRating } from './schemas/course-rating.schema';
import { UserProgress } from '../users/schemas/user-progress.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { RateCourseDto } from './dto/rate-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Unit.name) private unitModel: Model<Unit>,
    @InjectModel(Section.name) private sectionModel: Model<Section>,
    @InjectModel(CourseRating.name) private ratingModel: Model<CourseRating>,
    @InjectModel(UserProgress.name) private progressModel: Model<UserProgress>,
  ) {}

  // Public - get all courses (for visitors and users)
  async findAll(userId?: string) {
    const courses = await this.courseModel.find().lean().exec();

    if (!userId) {
      // For visitors - return basic course info only
      return courses.map((course) => ({
        _id: course._id,
        title: course.title,
        description: course.description,
        rating: course.rating,
        duration: course.duration,
        totalLessons: course.totalLessons,
        level: course.level,
        picture: course.picture,
        ratingCount: course.ratingCount,
      }));
    }

    // For authenticated users - include progress
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progress = await this.progressModel
          .findOne({
            userId: new Types.ObjectId(userId),
            courseId: course._id,
          })
          .lean();

        return {
          ...course,
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
    const course = await this.courseModel.findById(id).lean().exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Get units with sections and lessons
    const units = await this.unitModel
      .find({ courseId: id })
      .sort({ order: 1 })
      .lean();
    const courseWithUnits = {
      ...course,
      units: await Promise.all(
        units.map(async (unit) => {
          const sections = await this.sectionModel
            .find({ unitId: unit._id })
            .sort({ order: 1 })
            .lean();
          return {
            ...unit,
            sections: sections,
          };
        }),
      ),
    };

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
    const newCourse = new this.courseModel({
      ...createCourseDto,
      picture: pictureUrl,
    });
    return newCourse.save();
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
