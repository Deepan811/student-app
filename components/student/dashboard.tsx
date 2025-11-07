
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ensureAbsoluteUrl = (url: string) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export const Dashboard = ({ profile }) => {
  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 text-gray-100">
        <CardHeader>
          <CardTitle className="text-white">Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong className="text-blue-300">Name:</strong> {profile.name}</p>
          <p><strong className="text-blue-300">Email:</strong> {profile.email}</p>
          <p><strong className="text-blue-300">College:</strong> {profile.collegeName || 'Not specified'}</p>
          {profile.socialLinks && profile.socialLinks.length > 0 && (
            <div>
              <h4 className="font-semibold text-blue-300 mt-4 mb-2">Social Links:</h4>
              <div className="flex flex-wrap gap-3">
                {profile.socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={ensureAbsoluteUrl(link.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                  >
                    {link.heading}
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 text-gray-100">
        <CardHeader>
          <CardTitle className="text-white">Enrolled Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.enrolledCourses && profile.enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.enrolledCourses.map((course) => (
                <Card key={course.batchId} className="bg-gray-900/60 border border-gray-700 text-gray-200 hover:border-blue-500 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white">{course.course.name}</CardTitle>
                    <CardDescription className="text-gray-400">Batch: {course.batchName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p><span className="font-semibold text-blue-300">Trainer:</span> {course.trainer.name}</p>
                    <p><span className="font-semibold text-blue-300">Course Fee:</span> ${course.fees}</p>
                    <p>
                      <span className="font-semibold text-blue-300">Payment Status:</span>
                      <span className={`ml-2 ${course.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {course.paymentStatus === 'partially-paid'
                          ? `Partially Paid ($${course.amountPaid} / $${course.fees})`
                          : course.paymentStatus}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">You are not currently enrolled in any courses.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
