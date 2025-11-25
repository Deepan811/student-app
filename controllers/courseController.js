import Course from '../models/Course';
import dbConnect from '../lib/dbConnect';

export const getAllCourses = async () => {
  try {
    await dbConnect();
    const courses = await Course.find({});
    return { status: 200, success: true, data: courses };
  } catch (error) {
    return { status: 500, success: false, message: error.message };
  }
};

export const createCourse = async (req) => {
  try {
    await dbConnect();
    const course = new Course(req.body);
    await course.save();
    return { status: 201, success: true, data: course };
  } catch (error) {
    return { status: 400, success: false, message: error.message };
  }
};

export const getCourseById = async (id) => {
  try {
    await dbConnect();
    const course = await Course.findById(id);
    if (!course) {
      return { status: 404, success: false, message: 'Course not found' };
    }
    return { status: 200, success: true, data: course };
  } catch (error) {
    return { status: 500, success: false, message: error.message };
  }
};

export const updateCourse = async (req) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const body = req.body;
    const course = await Course.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!course) {
      return { status: 404, success: false, message: 'Course not found' };
    }
    return { status: 200, success: true, data: course };
  } catch (error) {
    return { status: 400, success: false, message: error.message };
  }
};

export const deleteCourse = async (req) => {
  try {
    await dbConnect();
    const { id } = req.params;
    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return { status: 404, success: false, message: 'Course not found' };
    }
    return { status: 200, success: true, data: { message: 'Course deleted successfully' } };
  } catch (error) {
    return { status: 500, success: false, message: error.message };
  }
};
