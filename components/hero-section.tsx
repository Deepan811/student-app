"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { RobotAnimation } from "./robot-animation"

export function HeroSection() {
  return (
    <section className="bg-gray-900 py-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary rounded-full"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-secondary rounded-full"
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-16 h-16 bg-accent rounded-lg"
          animate={{
            y: [0, -15, 0],
            x: [0, 15, 0],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-primary rounded-lg"
          animate={{
            y: [0, 15, 0],
            x: [0, -15, 0],
            rotate: [0, -90, -180],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      </div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold text-white mb-6"
          style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}
        >
          Master New Skills with
          <span className="text-primary"> Premium Courses</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          Join thousands of students learning from industry experts. Start your
          journey today with our carefully curated course catalog.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            Browse Courses
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 bg-transparent text-white hover:bg-primary hover:text-white"
          >
            Learn More
          </Button>
        </motion.div>
      </div>
      <motion.div
        className="absolute top-1/2 left-0 transform -translate-y-1/2 w-1/3 z-0"
        animate={{
          x: ["-100%", "400%"],
          y: ["-10%", "10%", "-10%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear"
        }}
      >
        <RobotAnimation />
      </motion.div>
    </section>
  )
}
