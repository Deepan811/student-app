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
    </div>
  );
};