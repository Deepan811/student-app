import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CourseCardProps {
  title: string
  image: string
  originalPrice: number
  discountPrice: number
  description: string
}

const imagePathMap: { [key: string]: string } = {
  "/images/react-course.png": "/web-dev-bootcamp.png",
  "/images/nodejs-course.png": "/web-dev-bootcamp.png",
  "/images/python-course.png": "/data-science-ml-analytics.png",
  "/images/uiux-course.png": "/ui-ux-design-concept.png",
  "/images/ml-course.png": "/data-science-ml-analytics.png",
};

export function CourseCard({ title, image, originalPrice, discountPrice, description }: CourseCardProps) {
  const discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
  const correctedImagePath = imagePathMap[image] || image || "/placeholder.svg";

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden">
          <img
            src={correctedImagePath}
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discountPercentage > 0 && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
              {discountPercentage}% OFF
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{description}</p>

        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">${discountPrice}</span>
          {originalPrice > discountPrice && (
            <span className="text-lg text-gray-400 line-through">${originalPrice}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Enroll</Button>
      </CardFooter>
    </Card>
  )
}
