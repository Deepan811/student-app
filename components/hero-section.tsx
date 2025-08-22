import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="bg-background py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Master New Skills with
          <span className="text-primary"> Premium Courses</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of students learning from industry experts. Start your journey today with our carefully curated
          course catalog.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
            Browse Courses
          </Button>
          <Button size="lg" variant="outline" className="px-8 bg-transparent hover:text-red-500">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}
