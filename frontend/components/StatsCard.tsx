'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface StatsCardProps {
  icon: ReactNode
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
}

export function StatsCard({ icon, title, value, change, changeType }: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      case 'neutral':
        return 'text-neutral-600'
      default:
        return 'text-neutral-600'
    }
  }

  return (
    <motion.div
      className="card hover:shadow-md transition-shadow duration-200"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <div>
            <p className="text-sm text-neutral-600">{title}</p>
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
          </div>
        </div>
        <div className={`text-sm font-medium ${getChangeColor()}`}>
          {change}
        </div>
      </div>
    </motion.div>
  )
} 