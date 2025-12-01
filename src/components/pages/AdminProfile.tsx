import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  LogOut,
  Eye,
  UserCheck,
  UserPlus,
  Mail,
  Zap,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { User } from '../utils/Users';
import type { ScheduleConflict } from '../utils/scheduling-utils';
import { autoAssignRA, checkScheduleConflict } from '../utils/scheduling-utils';
import { CalendarView } from '../views/CalendarView';
import type { EventInput } from '@fullcalendar/core';
import type { Study, ResearchAssistant} from "../utils/interfaces";

interface AdminProfileProps {
  user: User;
  onLogout: () => void;
}

interface HourEntry {
  id: string;
  raName: string;
  studyTitle: string;
  date: string;
  hours: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

const mockRAs: ResearchAssistant[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@university.edu',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9e0f97f?w=150&h=150&fit=crop&crop=face',
    totalHours: 45,
    pendingHours: 6.5,
    availability: ['Monday 9:00 AM - 12:00 PM', 'Wednesday 9:00 AM - 12:00 PM', 'Friday 9:00 AM - 11:00 AM']
  },
  {
    id: '2',
    name: 'Alex Kumar',
    email: 'alex.kumar@university.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    totalHours: 32,
    pendingHours: 4,
    availability: ['Tuesday 10:00 AM - 1:00 PM', 'Thursday 10:00 AM - 2:00 PM']
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma.wilson@university.edu',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    totalHours: 28,
    pendingHours: 2.5,
    availability: ['Monday 2:00 PM - 5:00 PM', 'Wednesday 1:00 PM - 4:00 PM', 'Friday 9:00 AM - 11:00 AM']
  }
];

const mockStudies: Study[] = [
  {
    id: '1',
    title: 'Cognitive Behavior Study',
    description: 'Observational study on decision-making patterns in college students',
    date: '2025-11-20',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    location: 'Psychology Lab A',
    assignedRA: 'Sarah Chen',
    status: 'completed',
    // priority: 'high'
  },
  {
    id: '2',
    title: 'Social Media Impact Research',
    description: 'Long-term study on social media usage and academic performance',
    date: '2025-11-18',
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    location: 'Research Center B',
    assignedRA: 'Sarah Chen',
    status: 'assigned',
    //priority: 'medium'
  },
  {
    id: '3',
    title: 'Memory Formation Study',
    description: 'EEG study examining memory consolidation during sleep',
    date: '2025-11-15',
    startTime: '9:00 AM',
    endTime: '12:00 PM',
    location: 'Neuroscience Lab',
    assignedRA: '',
    status: 'open',
    //priority: 'low'
  }
];

const mockStudiesForSA : Study[] = [
  {
    id: '4',
    title: 'Cognitive Behavior Study',
    description: 'Observational study on decision-making patterns in college students',
    date: '2025-11-20',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    location: 'Psychology Lab A',
    assignedRA: 'Sarah Chen',
    status: 'open',
    // priority: 'high'
  },
  {
    id: '6',
    title: 'Social Media Impact Research',
    description: 'Long-term study on social media usage and academic performance',
    date: '2025-11-18',
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    location: 'Research Center B',
    assignedRA: 'Sarah Chen',
    status: 'assigned',
    //priority: 'medium'
  },
  {
    id: '7',
    title: 'Memory Formation Study',
    description: 'EEG study examining memory consolidation during sleep',
    date: '2025-11-15',
    startTime: '9:00 AM',
    endTime: '12:00 PM',
    location: 'Neuroscience Lab',
    assignedRA: '',
    status: 'open',
    //priority: 'low'
  }
];

const mockHourEntries: HourEntry[] = [
  {
    id: '1',
    raName: 'Sarah Chen',
    studyTitle: 'Cognitive Behavior Study',
    date: '2024-01-12',
    hours: 4,
    status: 'pending',
    notes: 'Completed data collection for 15 participants'
  },
  {
    id: '2',
    raName: 'Alex Kumar',
    studyTitle: 'Memory Formation Study',
    date: '2024-01-10',
    hours: 2.5,
    status: 'pending',
    notes: 'Setup equipment and ran preliminary tests'
  },
  {
    id: '3',
    raName: 'Emma Wilson',
    studyTitle: 'Language Processing Research',
    date: '2024-01-08',
    hours: 3,
    status: 'approved'
  }
];

export function AdminProfile({ user, onLogout }: AdminProfileProps) {
  const [hourEntries, setHourEntries] = useState<HourEntry[]>(mockHourEntries);
  const [studies, setStudies] = useState<Study[]>(mockStudies);
  const [isCreatingStudy, setIsCreatingStudy] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newStudy, setNewStudy] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    assignedRA: '',
    location: '',
  });

  const [newUser, setNewUser] = useState({
    id: '',
    name: '',
    email: '',
    role: 'ra' as 'ra' | 'scheduling_admin' | 'full_admin',
    tempPassword: ''
  });

  const calendarEvents = useMemo<EventInput[]>(() => {
    const parseTime = (timeStr: string, dateStr: string) => {
      let hour24: number, minutes: number;
      
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        const [time, period] = timeStr.split(' ');
        const [h, m] = time.split(':').map(Number);
        hour24 = h;
        if (period === 'PM' && h !== 12) hour24 += 12;
        if (period === 'AM' && h === 12) hour24 = 0;
        minutes = m || 0;
      } else {
        const [h, m] = timeStr.split(':').map(Number);
        hour24 = h;
        minutes = m || 0;
      }

      const date = new Date(dateStr);
      date.setHours(hour24, minutes, 0, 0);
      return date;
    };

    const statusColors: Record<Study['status'], string> = {
      open: '#f59e0b',
      assigned: '#3b82f6',
      completed: '#10b981'
    };

    return studies.map(study => {
      const startDate = parseTime(study.startTime, study.date);
      const endDate = parseTime(study.endTime, study.date);

      let eventTitle = study.title;
      if (study.assignedRA) eventTitle += ` - ${study.assignedRA}`;
      if (study.location) eventTitle += ` @ ${study.location}`;

      return {
        id: study.id,
        title: eventTitle,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        backgroundColor: statusColors[study.status],
        borderColor: statusColors[study.status],
        extendedProps: {
          location: study.location,
          status: study.status,
          assignedRA: study.assignedRA,
          description: study.description
        }
      };
    });
  }, [studies]);

  const handleCreateStudy = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStudy.title || !newStudy.date || !newStudy.startTime || !newStudy.endTime || !newStudy.assignedRA) {
      toast.error('Please fill in all required fields');
      return;
    }

    const study: Study = {
      id: Date.now().toString(),
      title: newStudy.title,
      description: newStudy.description,
      date: newStudy.date,
      startTime: newStudy.startTime,
      endTime: newStudy.endTime,
      assignedRA: newStudy.assignedRA,
      location: newStudy.location,
      status: 'open',
    };

    setStudies(prev => [study, ...prev]);

    setNewStudy({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      assignedRA: '',
      location: '',
    });

    setIsCreatingStudy(false);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.name || !newUser.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    console.log('Creating user:', newUser);
    
    setNewUser({
      id: '',
      name: '',
      email: '',
      role: 'ra',
      tempPassword: ''
    });
    setIsCreatingUser(false);
    toast.success(`User account created for ${newUser.name}. They will receive login instructions via email.`);
  };

  const getStatusBadge = (status: Study['status']) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Open</Badge>;
      case 'assigned':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Assigned</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
    }
  };

  const isFullAdmin = user.role === 'full_admin';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold">CORAL</h1>
              <p className="text-sm text-gray-600">Admin Dashboard</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Profile Header */}
        <div className="flex items-start gap-6 mb-8">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">{user.name}</h2>
            <p className="text-gray-600 mb-2">{user.email}</p>
            <Badge variant="outline" className="text-indigo-600 border-indigo-600">
              {user.role === 'full_admin' ? 'Full Administrator' : 'Scheduling Administrator'}
            </Badge>
            <div className="flex gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-indigo-600">{studies.length}</div>
                <div className="text-sm text-gray-600">Total Studies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-orange-600">
                  {studies.filter(s => s.status === 'open').length}
                </div>
                <div className="text-sm text-gray-600">Open Studies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-600">{mockRAs.length}</div>
                <div className="text-sm text-gray-600">Active RAs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="studies" className="space-y-6">
          <TabsList>
            {!isFullAdmin && <TabsTrigger value="mystudies">My Studies</TabsTrigger>}
            {!isFullAdmin && <TabsTrigger value="mycalendar">Personal Calendar</TabsTrigger>}
            <TabsTrigger value="calendar">Studies Calendar</TabsTrigger>
            {!isFullAdmin && <TabsTrigger value="availability">Availability</TabsTrigger> }
            {!isFullAdmin && <TabsTrigger value="hours">Hours Log</TabsTrigger> }
            <TabsTrigger value="studies">Study Management</TabsTrigger>
            <TabsTrigger value="ras">Research Assistants</TabsTrigger>
            {isFullAdmin && <TabsTrigger value="hours">Hour Approvals</TabsTrigger>}
            {isFullAdmin && <TabsTrigger value="users">User Management</TabsTrigger>}
          </TabsList>

          <TabsContent value="mystudies" className="space-y-4">
            <div className="grid gap-4">
              {studies.map((study) => (
                <Card key={study.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{study.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {study.description}
                        </CardDescription>
                      </div>
                      {/* <div className="flex gap-2">
                        {getStatusBadge(study.status)}
                        {study.status === 'assigned' && study.assignedRA && (
                          
                        )}
                      </div> */}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(study.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {study.startTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {study.endTime}
                      </div>
                      {study.location && <div>📍 {study.location}</div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="studies" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Research Studies</h3>
              <Button onClick={() => setIsCreatingStudy(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Study
              </Button>
            </div>

          
            {/* Form to Create a New Study */}
            {/* Scheduling Summary
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-semibold text-blue-600">
                    {studies.filter(s => s.status === 'assigned').length}
                  </div>
                  <div className="text-sm text-gray-600">Auto-assigned</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-semibold text-orange-600">
                    {studies.filter(s => s.status === 'open').length}
                  </div>
                  <div className="text-sm text-gray-600">Awaiting Assignment</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-semibold text-green-600">
                    {studies.filter(s => s.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-semibold text-indigo-600">
                    {Math.round((studies.filter(s => s.status === 'assigned').length / Math.max(studies.length, 1)) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Assignment Rate</div>
                </CardContent>
              </Card>
            </div> */}

            {isCreatingStudy && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Study</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateStudy} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Study Title *</Label>
                        <Input
                          id="title"
                          value={newStudy.title}
                          onChange={(e) => setNewStudy(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter study title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={newStudy.location}
                          onChange={(e) => setNewStudy(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Lab or room location"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newStudy.description}
                        onChange={(e) => setNewStudy(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the study"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newStudy.date}
                          onChange={(e) => setNewStudy(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time *</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={newStudy.startTime}
                          onChange={(e) => setNewStudy(prev => ({ ...prev, startTime: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time *</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={newStudy.endTime}
                          onChange={(e) => setNewStudy(prev => ({ ...prev, endTime: e.target.value }))}
                        />
                      </div>
                    </div>
            
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={newStudy.assignedRA}
                        onValueChange={(ra : string) =>
                          setNewStudy(prev => ({ ...prev, assignedRA: ra }))
                        }
                        
                      >
                       <SelectTrigger>
                          <SelectValue placeholder="Select a Research Assistant"/>
                        </SelectTrigger>
                        <SelectContent>
                          {/* TODO: Handle handle the API call and make a dropdown of possible RA's to assign based on their availability and time of new study */}

                          {mockRAs.map((ra) => (
                            <SelectItem key={ra.id} value={ra.name}> { ra.name } </SelectItem>
                          ))}

                          {/* <SelectItem value="ra">Research Assistant</SelectItem>
                          <SelectItem value="scheduling_admin">Scheduling Administrator</SelectItem>
                          <SelectItem value="full_admin">Full Administrator</SelectItem> */}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">Create Study</Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreatingStudy(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            
            <div className="grid gap-4">
              {studies.map((study) => (
                <Card key={study.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{study.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {study.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(study.status)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(study.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {study.startTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {study.endTime}
                      </div>
                      {study.location && <div>📍 {study.location}</div>}
                      {study.assignedRA && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {study.assignedRA}
                        </div>
                      )}
                    </div>

                    <div className='flex items-center'>
                      { !study.assignedRA && (
                          <form className="space-y-4">
                            <Select 
                              value={newStudy.assignedRA}
                              onChange = {(value) => {
                                setNewStudy(prev => ({
                                  ...prev,
                                  assignedRA: value
                                }))
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a Research Assistant"/>
                                </SelectTrigger>
            
                                <SelectContent>
                                  {/* TODO: Handle handle the API call and make a dropdown of possible RA's to assign based on their availability and time of new study */}

                                  {mockRAs.map((ra) => (
                                    <SelectItem key={ra.id} value={ra.name}> { ra.name } </SelectItem>
                                  ))}
                                </SelectContent>
                                <Button className="gap-2">
                                  Confirm
                                </Button>
                              </div>
                              
                            </Select>
                          </form>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* CALENDAR */}
          <TabsContent value="calendar">
            <CalendarView events={calendarEvents} height={600} />
          </TabsContent>
          
          {/* RESEARCH ASSISTANTS */}
          <TabsContent value="ras">
            <Card>
              <CardHeader>
                <CardTitle>Research Assistants</CardTitle>
                <CardDescription>
                  View and manage your research assistant team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRAs.map((ra) => (
                    <div key={ra.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={ra.avatar} alt={ra.name} />
                          <AvatarFallback>{ra.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{ra.name}</div>
                          <div className="text-sm text-gray-600">{ra.email}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            Available: {ra.availability.map(slot => {
                              const parts = slot.split(' ');
                              const day = parts[0].slice(0, 3);
                              const timeRange = parts.slice(1).join(' ').replace(':00 AM', '').replace(':00 PM', 'p').replace(' - ', '-');
                              return `${day} ${timeRange}`;
                            }).join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="font-medium">{ra.totalHours}h</div>
                          <div className="text-xs text-gray-600">Total</div>
                        </div>
                        {ra.pendingHours > 0 && (
                          <div className="text-center">
                            <div className="font-medium text-orange-600">{ra.pendingHours}h</div>
                            <div className="text-xs text-gray-600">Pending</div>
                          </div>
                        )}
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* HOUR APPROVALS */}
          {isFullAdmin && (
            <TabsContent value="hours">
              <Card>
                <CardHeader>
                  <CardTitle>Hour Approvals</CardTitle>
                  <CardDescription>
                    Review and approve RA hour submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hourEntries.map((entry) => (
                      <div key={entry.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-medium">{entry.raName}</div>
                            <div className="text-sm text-gray-600">{entry.studyTitle}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(entry.date).toLocaleDateString()} • {entry.hours} hours
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {entry.status === 'pending' ? (
                              <>
                                <Button 
                                  size="sm"
                                  // onClick={() => handleHourApproval(entry.id, 'approve')}
                                  className="gap-1"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  // onClick={() => handleHourApproval(entry.id, 'reject')}
                                  className="gap-1"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </Button>
                              </>
                            ) : (
                              <Badge 
                                variant="outline" 
                                className={entry.status === 'approved' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}
                              >
                                {entry.status === 'approved' ? 'Approved' : 'Rejected'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {entry.notes && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            <strong>Notes:</strong> {entry.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* USER MANAGEMENT */}
          {isFullAdmin && (
            <TabsContent value="users">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">User Management</h3>
                    <p className="text-sm text-gray-600">Create and manage user accounts for RAs and admins</p>
                  </div>
                  <Button onClick={() => setIsCreatingUser(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create User
                  </Button>
                </div>

                {isCreatingUser && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Create New User Account</CardTitle>
                      <CardDescription>
                        Create an account for a new research assistant or administrator
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="userName">Full Name *</Label>
                            <Input
                              id="userName"
                              value={newUser.name}
                              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="userEmail">Email Address *</Label>
                            <Input
                              id="userEmail"
                              type="email"
                              value={newUser.email}
                              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="ttrojan@usc.edu"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="userRole">Role</Label>
                          <Select 
                            value={newUser.role} 
                            onValueChange={(value: typeof newUser.role) => 
                              setNewUser(prev => ({ ...prev, role: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ra">Research Assistant</SelectItem>
                              <SelectItem value="scheduling_admin">Scheduling Administrator</SelectItem>
                              <SelectItem value="full_admin">Full Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900">Account Setup</h4>
                              <p className="text-sm text-blue-700 mt-1">
                                A temporary password will be generated and sent to the user's email address. 
                                They will be required to change it on first login.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit">Create Account</Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsCreatingUser(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Users List */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Users</CardTitle>
                    <CardDescription>
                      All registered users in the CORAL system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Current user */}
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name} (You)</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                            <Badge variant="outline" className="text-indigo-600 border-indigo-600 mt-1">
                              {user.role === 'full_admin' ? 'Full Administrator' : 'Scheduling Administrator'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Other mock users */}
                      {mockRAs.map((ra) => (
                        <div key={ra.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={ra.avatar} alt={ra.name} />
                              <AvatarFallback>{ra.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{ra.name}</div>
                              <div className="text-sm text-gray-600">{ra.email}</div>
                              <Badge variant="outline" className="text-green-600 border-green-600 mt-1">
                                Research Assistant
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              Deactivate
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
