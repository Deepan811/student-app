import dbConnect from '../lib/dbConnect.js';
import Course from '../models/Course.js';

const courses = [
  {
    name: 'Introduction to React',
    description: 'Learn the fundamentals of React.',
    price: 49.99,
    discountPrice: 29.99,
    image: '/images/react-course.png',
    instructor: 'John Doe',
    duration: '4 weeks',
    level: 'Beginner',
    category: 'Web Development',
  },
  {
    name: 'Advanced Node.js',
    description: 'Deep dive into Node.js concepts.',
    price: 99.99,
    discountPrice: 79.99,
    image: '/images/nodejs-course.png',
    instructor: 'Jane Smith',
    duration: '6 weeks',
    level: 'Intermediate',
    category: 'Web Development',
  },
  {
    name: 'Python for Data Science',
    description: 'Learn Python for data analysis and visualization.',
    price: 79.99,
    discountPrice: 59.99,
    image: '/images/python-course.png',
    instructor: 'Peter Jones',
    duration: '8 weeks',
    level: 'Beginner',
    category: 'Data Science',
  },
  {
    name: 'UI/UX Design Fundamentals',
    description: 'Learn the principles of UI/UX design.',
    price: 69.99,
    discountPrice: 49.99,
    image: '/images/uiux-course.png',
    instructor: 'Emily White',
    duration: '5 weeks',
    level: 'Beginner',
    category: 'Design',
  },
  {
    name: 'Introduction to Machine Learning',
    description: 'Learn the basics of machine learning.',
    price: 129.99,
    discountPrice: 99.99,
    image: '/images/ml-course.png',
    instructor: 'David Green',
    duration: '10 weeks',
    level: 'Intermediate',
    category: 'Data Science',
  },
];

const seedCourses = async () => {
  try {
    await dbConnect();

    await Course.deleteMany({});
    await Course.insertMany(courses);

    console.log('Successfully seeded courses');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
};

seedCourses();