'use client';

import { motion } from 'framer-motion';
import { FileText, Users, Zap, Globe } from 'lucide-react';
import type { ReactNode } from 'react';

const features = [
  {
    icon: FileText,
    title: 'Smart Documents',
    description: 'Create powerful documents with blocks, just like Notion',
  },
  {
    icon: Users,
    title: 'Real-time Collaboration',
    description: 'Work together with your team in real-time',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built for speed and performance',
  },
  {
    icon: Globe,
    title: 'Accessible Anywhere',
    description: 'Access your workspace from any device',
  },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        {children}
      </div>

      {/* Right side - Features/Branding */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            backgroundSize: '100% 100%',
          }}
        />

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-5xl font-bold mb-4">CollabSpace</h2>
            <p className="text-xl text-blue-100">
              Your all-in-one collaborative workspace for teams
            </p>
          </motion.div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg"
              >
                <div className="shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-blue-100">
              Trusted by teams worldwide for seamless collaboration
            </p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>
    </div>
  );
}
