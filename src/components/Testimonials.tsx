import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Alex Rivera",
    role: "Senior Developer",
    content: "CodeConnect has revolutionized how our team collaborates. The real-time features are incredible!",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
  },
  {
    name: "Sarah Chen",
    role: "Tech Lead",
    content: "The best code collaboration tool I've ever used. It's like Google Docs for developers!",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
  },
  {
    name: "Michael Kim",
    role: "Full Stack Developer",
    content: "Seamless integration and fantastic UI. Makes remote pair programming a breeze.",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Loved by Developers</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Join thousands of developers who are already using CodeConnect to collaborate and build amazing projects.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 relative"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-cyan-500/20" />
              <div className="flex items-center space-x-4 mb-4">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-slate-300">{testimonial.content}</p>
              <motion.div
                className="absolute inset-0 border-2 border-cyan-500/20 rounded-xl"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(6, 182, 212, 0.1)",
                    "0 0 40px rgba(6, 182, 212, 0.2)",
                    "0 0 20px rgba(6, 182, 212, 0.1)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

