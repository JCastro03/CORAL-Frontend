

export interface Study {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  assignedRA?: string;
  status: 'open' | 'assigned' | 'completed' | 'pending' | 'declined';
  approved?: boolean;
  experimentId?: number;
  timeslotId?: number;
  durationMinutes?: number;
  numSignedUp?: number;
  numStudents?: number;
  surveyFlag?: number;
  webFlag?: number;
  videoconfFlag?: number;
  videoconfUrl?: string | null;
  timelineDate?: string;
  site?: string;
}

export interface ResearchAssistant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalHours: number;
  pendingHours: number;
  availability: string[];
}
