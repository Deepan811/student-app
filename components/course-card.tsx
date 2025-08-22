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

export function CourseCard({ title, image, originalPrice, discountPrice, description }: CourseCardProps) {
  const discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100)

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={image || "/placeholder.svg"}
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
        <h3 className="text-xl font-bold text-card-foreground mb-2 line-clamp-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{description}</p>

        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">${discountPrice}</span>
          {originalPrice > discountPrice && (
            <span className="text-lg text-muted-foreground line-through">${originalPrice}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Enroll</Button>
      </CardFooter>
    </Card>
  )
}
