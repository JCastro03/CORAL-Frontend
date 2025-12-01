

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