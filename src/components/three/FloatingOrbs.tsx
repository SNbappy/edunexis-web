import { motion } from 'framer-motion'

interface Orb {
    size: string
    color: string
    top: string
    left: string
    delay: number
    duration: number
    blur: string
    opacity: string
}

const orbs: Orb[] = [
    { size: 'w-96 h-96', color: 'bg-indigo-600', top: '-10%', left: '-5%', delay: 0, duration: 8, blur: 'blur-3xl', opacity: 'opacity-20 dark:opacity-15' },
    { size: 'w-80 h-80', color: 'bg-cyan-500', top: '60%', left: '70%', delay: 2, duration: 10, blur: 'blur-3xl', opacity: 'opacity-15 dark:opacity-10' },
    { size: 'w-64 h-64', color: 'bg-violet-600', top: '30%', left: '80%', delay: 4, duration: 7, blur: 'blur-2xl', opacity: 'opacity-20 dark:opacity-15' },
    { size: 'w-48 h-48', color: 'bg-purple-500', top: '75%', left: '10%', delay: 1, duration: 9, blur: 'blur-2xl', opacity: 'opacity-15 dark:opacity-10' },
    { size: 'w-56 h-56', color: 'bg-indigo-400', top: '10%', left: '55%', delay: 3, duration: 11, blur: 'blur-3xl', opacity: 'opacity-10 dark:opacity-8' },
]

export default function FloatingOrbs() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {orbs.map((orb, i) => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full ${orb.size} ${orb.color} ${orb.blur} ${orb.opacity}`}
                    style={{ top: orb.top, left: orb.left }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 15, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: orb.duration,
                        delay: orb.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    )
}
