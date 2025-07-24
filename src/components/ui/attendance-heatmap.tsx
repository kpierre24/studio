import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subWeeks, addDays } from "date-fns"

interface AttendanceData {
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  metadata?: Record<string, any>
}

interface AttendanceHeatmapProps {
  data: AttendanceData[]
  weeks?: number
  title?: string
  subtitle?: string
  className?: string
  animate?: boolean
  onDayClick?: (date: Date, attendance?: AttendanceData) => void
}

const statusColors = {
  present: "bg-green-500",
  late: "bg-yellow-500", 
  excused: "bg-blue-500",
  absent: "bg-red-500",
  none: "bg-muted"
}

const statusLabels = {
  present: "Present",
  late: "Late",
  excused: "Excused",
  absent: "Absent",
  none: "No data"
}

export function AttendanceHeatmap({
  data,
  weeks = 12,
  title = "Attendance Overview",
  subtitle,
  className,
  animate = true,
  onDayClick
}: AttendanceHeatmapProps) {
  const today = new Date()
  const startDate = startOfWeek(subWeeks(today, weeks - 1))
  const endDate = endOfWeek(today)
  
  const allDays = eachDayOfInterval({ start: startDate, end: endDate })
  
  // Group days by week
  const weekGroups: Date[][] = []
  let currentWeek: Date[] = []
  
  allDays.forEach((day, index) => {
    currentWeek.push(day)
    if (currentWeek.length === 7 || index === allDays.length - 1) {
      weekGroups.push([...currentWeek])
      currentWeek = []
    }
  })

  const getAttendanceForDate = (date: Date): AttendanceData | undefined => {
    return data.find(attendance => 
      isSameDay(new Date(attendance.date), date)
    )
  }

  const getStatusForDate = (date: Date): keyof typeof statusColors => {
    const attendance = getAttendanceForDate(date)
    return attendance?.status || 'none'
  }

  // Calculate statistics
  const stats = {
    present: data.filter(d => d.status === 'present').length,
    late: data.filter(d => d.status === 'late').length,
    excused: data.filter(d => d.status === 'excused').length,
    absent: data.filter(d => d.status === 'absent').length,
  }

  const totalDays = Object.values(stats).reduce((sum, count) => sum + count, 0)
  const attendanceRate = totalDays > 0 ? ((stats.present + stats.late) / totalDays) * 100 : 0

  const heatmapContent = (
    <div className={cn("w-full", className)}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 rounded-lg border">
          <p className="text-2xl font-bold text-green-600">{attendanceRate.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">Attendance Rate</p>
        </div>
        <div className="text-center p-3 rounded-lg border">
          <p className="text-2xl font-bold">{stats.present}</p>
          <p className="text-sm text-muted-foreground">Present</p>
        </div>
        <div className="text-center p-3 rounded-lg border">
          <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
          <p className="text-sm text-muted-foreground">Late</p>
        </div>
        <div className="text-center p-3 rounded-lg border">
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          <p className="text-sm text-muted-foreground">Absent</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="space-y-4">
        {/* Month labels */}
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          {weekGroups.length > 0 && (
            <>
              <span>{format(weekGroups[0][0], 'MMM yyyy')}</span>
              <span>{format(weekGroups[weekGroups.length - 1][6] || weekGroups[weekGroups.length - 1][weekGroups[weekGroups.length - 1].length - 1], 'MMM yyyy')}</span>
            </>
          )}
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-8 gap-1 text-xs text-muted-foreground">
          <div></div> {/* Empty cell for week numbers */}
          <div className="text-center">Sun</div>
          <div className="text-center">Mon</div>
          <div className="text-center">Tue</div>
          <div className="text-center">Wed</div>
          <div className="text-center">Thu</div>
          <div className="text-center">Fri</div>
          <div className="text-center">Sat</div>
        </div>

        {/* Heatmap grid */}
        <motion.div 
          className="space-y-1"
          variants={animate ? staggerContainer : undefined}
          initial={animate ? "initial" : undefined}
          animate={animate ? "animate" : undefined}
        >
          {weekGroups.map((week, weekIndex) => (
            <motion.div 
              key={weekIndex}
              className="grid grid-cols-8 gap-1"
              variants={animate ? staggerItem : undefined}
            >
              {/* Week number */}
              <div className="text-xs text-muted-foreground text-center py-1">
                {format(week[0], 'w')}
              </div>
              
              {/* Days of the week */}
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const day = week[dayIndex]
                if (!day) {
                  return <div key={dayIndex} className="w-4 h-4" />
                }
                
                const status = getStatusForDate(day)
                const attendance = getAttendanceForDate(day)
                const isToday = isSameDay(day, today)
                
                return (
                  <motion.button
                    key={dayIndex}
                    className={cn(
                      "w-4 h-4 rounded-sm transition-all duration-200 hover:scale-110",
                      statusColors[status],
                      isToday && "ring-2 ring-primary ring-offset-1",
                      onDayClick && "cursor-pointer"
                    )}
                    onClick={() => onDayClick?.(day, attendance)}
                    title={`${format(day, 'MMM d, yyyy')}: ${statusLabels[status]}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                )
              })}
            </motion.div>
          ))}
        </motion.div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 pt-4">
          <span className="text-sm text-muted-foreground">Less</span>
          {Object.entries(statusColors).filter(([key]) => key !== 'none').map(([status, color]) => (
            <div key={status} className="flex items-center space-x-1">
              <div className={cn("w-3 h-3 rounded-sm", color)} />
              <span className="text-xs text-muted-foreground capitalize">{status}</span>
            </div>
          ))}
          <span className="text-sm text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  )

  if (animate) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {heatmapContent}
      </motion.div>
    )
  }

  return heatmapContent
}

// Student attendance component
interface StudentAttendanceProps {
  studentId: string
  courseId: string
  attendance: AttendanceData[]
  className?: string
}

export function StudentAttendance({ 
  studentId, 
  courseId, 
  attendance, 
  className 
}: StudentAttendanceProps) {
  const handleDayClick = (date: Date, attendanceData?: AttendanceData) => {
    console.log('Clicked date:', date, 'Attendance:', attendanceData)
    // Handle day click - could open a modal with more details
  }

  return (
    <AttendanceHeatmap
      data={attendance}
      title="Your Attendance"
      subtitle="Track your class attendance over time"
      className={className}
      onDayClick={handleDayClick}
    />
  )
}

// Class attendance overview component
interface ClassAttendanceOverviewProps {
  students: Array<{
    id: string
    name: string
    attendance: AttendanceData[]
  }>
  className?: string
}

export function ClassAttendanceOverview({ students, className }: ClassAttendanceOverviewProps) {
  // Aggregate attendance data for the class
  const allAttendance = students.flatMap(student => student.attendance)
  
  return (
    <div className={className}>
      <AttendanceHeatmap
        data={allAttendance}
        title="Class Attendance Overview"
        subtitle={`Attendance patterns for ${students.length} students`}
      />
      
      {/* Individual student summaries */}
      <div className="mt-8 space-y-4">
        <h4 className="text-md font-semibold">Individual Student Attendance</h4>
        <div className="grid gap-4">
          {students.map(student => {
            const presentDays = student.attendance.filter(a => a.status === 'present').length
            const totalDays = student.attendance.length
            const rate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0
            
            return (
              <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {presentDays}/{totalDays} days present
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-semibold",
                    rate >= 90 ? "text-green-600" : 
                    rate >= 80 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}