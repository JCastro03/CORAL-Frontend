// Utility functions for scheduling logic

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface ScheduleConflict {
  raId: string;
  raName: string;
  reason: 'unavailable' | 'conflict' | 'available';
  conflictDetails?: string;
}

// Parse time string to minutes for easy comparison
export function timeToMinutes(timeStr: string): number {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  //let totalMinutes = hours * 60 + minutes;
  
  if (period === 'PM' && hours !== 12) {
    //totalMinutes += 12 * 60;
    hours = 0;
  } else if (period === 'AM' && hours === 12) {
    //totalMinutes = minutes;
    hours += 12;
  }
  
  return hours * 60 + minutes;
}

// Convert minutes back to time string
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

// Parse availability string to structured time slots
export function parseAvailability(availabilityStrings: string[]): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  availabilityStrings.forEach(slot => {
    // Parse format like "Monday 9-12" or "Monday 9:00 AM - 12:00 PM"
    const parts = slot.split(' ');
    const day = parts[0];
    
    let timeRange = parts.slice(1).join(' ');
    
    // Handle different time formats
    if (timeRange.includes('-') && !timeRange.includes('AM') && !timeRange.includes('PM')) {
      // Format: "9-12"
      const [start, end] = timeRange.split('-');
      const startTime = `${start}:00 AM`;
      const endTime = `${end}:00 ${parseInt(end) <= 12 ? 'PM' : 'PM'}`;
      
      slots.push({
        day,
        startTime,
        endTime
      });
    } else if (timeRange.includes('-')) {
      // Format: "9:00 AM - 12:00 PM"
      const [startTime, endTime] = timeRange.split(' - ');
      slots.push({
        day,
        startTime,
        endTime
      });
    }
  });
  
  return slots;
}

// Check if a study time conflicts with existing assignments or availability
export function checkScheduleConflict(
  studyDate: string,
  studyTime: string,
  studyDuration: number,
  raAvailability: string[],
  existingAssignments: Array<{
    date: string;
    time: string;
    duration: number;
    assignedRA?: string;
  }>,
  raName: string
): ScheduleConflict {
  const studyDay = new Date(studyDate).toLocaleDateString('en-US', { weekday: 'long' });
  const studyStartMinutes = timeToMinutes(studyTime);
  const studyEndMinutes = studyStartMinutes + (studyDuration * 60);
  
  // Parse RA availability
  const availableSlots = parseAvailability(raAvailability);
  
  // Check if RA is available during this time
  const isAvailable = availableSlots.some(slot => {
    if (slot.day !== studyDay) return false;
    
    const slotStartMinutes = timeToMinutes(slot.startTime);
    const slotEndMinutes = timeToMinutes(slot.endTime);
    
    return studyStartMinutes >= slotStartMinutes && studyEndMinutes <= slotEndMinutes;
  });
  
  if (!isAvailable) {
    const availableTimes = availableSlots
      .filter(slot => slot.day === studyDay)
      .map(slot => `${slot.startTime} - ${slot.endTime}`)
      .join(', ');
    
    return {
      raId: raName.toLowerCase().replace(' ', ''),
      raName,
      reason: 'unavailable',
      conflictDetails: availableTimes ? `Available: ${availableTimes}` : 'Not available on this day'
    };
  }
  
  // Check for conflicts with existing assignments
  const hasConflict = existingAssignments.some(assignment => {
    if (assignment.assignedRA !== raName || assignment.date !== studyDate) {
      return false;
    }
    
    const assignmentStartMinutes = timeToMinutes(assignment.time);
    const assignmentEndMinutes = assignmentStartMinutes + (assignment.duration * 60);
    
    // Check for overlap
    return !(studyEndMinutes <= assignmentStartMinutes || studyStartMinutes >= assignmentEndMinutes);
  });
  
  if (hasConflict) {
    const conflictingAssignment = existingAssignments.find(assignment => {
      if (assignment.assignedRA !== raName || assignment.date !== studyDate) {
        return false;
      }
      
      const assignmentStartMinutes = timeToMinutes(assignment.time);
      const assignmentEndMinutes = assignmentStartMinutes + (assignment.duration * 60);
      
      return !(studyEndMinutes <= assignmentStartMinutes || studyStartMinutes >= assignmentEndMinutes);
    });
    
    return {
      raId: raName.toLowerCase().replace(' ', ''),
      raName,
      reason: 'conflict',
      conflictDetails: conflictingAssignment ? 
        `Conflicts with study at ${conflictingAssignment.time}` : 
        'Time conflict with existing assignment'
    };
  }
  
  return {
    raId: raName.toLowerCase().replace(' ', ''),
    raName,
    reason: 'available'
  };
}

// Automatically assign the best available RA to a study
export function autoAssignRA(
  studyDate: string,
  studyTime: string,
  studyDuration: number,
  availableRAs: Array<{
    id: string;
    name: string;
    availability: string[];
    totalHours: number;
  }>,
  existingAssignments: Array<{
    date: string;
    time: string;
    duration: number;
    assignedRA?: string;
  }>
): string | null {
  const raConflicts = availableRAs.map(ra => 
    checkScheduleConflict(
      studyDate,
      studyTime,
      studyDuration,
      ra.availability,
      existingAssignments,
      ra.name
    )
  );
  
  const availableRAs_filtered = raConflicts.filter(conflict => conflict.reason === 'available');
  
  if (availableRAs_filtered.length === 0) {
    return null; // No one available
  }
  
  // Sort by total hours (prefer RAs with fewer hours for load balancing)
  const sortedRAs = availableRAs_filtered
    .map(conflict => availableRAs.find(ra => ra.name === conflict.raName)!)
    .sort((a, b) => a.totalHours - b.totalHours);
  
  return sortedRAs[0].name;
}