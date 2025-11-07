
"use client"

import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

const features = [
  {
    title: "Expert Instructors",
    description: "Learn from industry experts with years of experience.",
  },
  {
    title: "Flexible Learning",
    description: "Learn at your own pace with our flexible course schedules.",
  },
  {
    title: "Career Opportunities",
    description: "Get access to our network of partner companies for job placements.",
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-16 px-6 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose Us?</h2>
          <p className="text-xl text-muted-foreground">
            Discover the advantages of learning with us
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
