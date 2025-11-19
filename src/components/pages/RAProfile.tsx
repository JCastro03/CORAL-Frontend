import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../utils/Users';
import { CalendarView } from './CalendarView';
import type { EventInput } from '@fullcalendar/core';

interface RAProfileProps {
  user: User;
  onLogout: () => void;
}

interface Study {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  hours?: number;
  approved?: boolean;
}

const mockStudies: Study[] = [
  {
    id: '1',
    title: 'Cognitive Behavior Study',
    description: 'Observational study on decision-making patterns in college students',
    date: '2024-01-15',
    time: '10:00 AM',
    duration: 3,
    location: 'Psychology Lab A',
    status: 'pending'
  },
  {
    id: '2',
    title: 'Social Media Usage Research',
    description: 'Survey-based research on social media habits and mental health',
    date: '2024-01-12',
    time: '2:00 PM',
    duration: 2,
    location: 'Research Center B',
    status: 'accepted'
  },
  {
    id: '3',
    title: 'Memory Formation Study',
    description: 'EEG study examining memory consolidation during sleep',
    date: '2024-01-08',
    time: '9:00 AM',
    duration: 4,
    location: 'Neuroscience Lab',
    status: 'completed',
    hours: 4,
    approved: true
  },
  {
    id: '4',
    title: 'Language Processing Research',
    description: 'fMRI study on bilingual language processing',
    date: '2024-01-05',
    time: '11:00 AM',
    duration: 2.5,
    location: 'Imaging Center',
    status: 'completed',
    hours: 2.5,
    approved: false
  }
];

const availabilitySlots = [
  { day: 'Monday', times: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'] },
  { day: 'Tuesday', times: ['10:00 AM - 1:00 PM'] },
  { day: 'Wednesday', times: ['9:00 AM - 12:00 PM', '1:00 PM - 4:00 PM'] },
  { day: 'Thursday', times: ['10:00 AM - 2:00 PM'] },
  { day: 'Friday', times: ['9:00 AM - 11:00 AM'] }
];

export function RAProfile({ user, onLogout }: RAProfileProps) {
  const [studies, setStudies] = useState<Study[]>(mockStudies);

  const calendarEvents = useMemo<EventInput[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const studyEvents = studies
      .filter(study => study.status !== 'declined')
      .map(study => {
        const [time, period] = study.time.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let hour24 = hours;
        if (period === 'PM' && hours !== 12) hour24 += 12;
        if (period === 'AM' && hours === 12) hour24 = 0;

        const startDate = new Date(study.date);
        startDate.setHours(hour24, minutes || 0, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + study.duration);

        const statusColors: Record<Study['status'], string> = {
          pending: '#f59e0b', // amber
          accepted: '#3b82f6', // blue
          completed: '#10b981', // green
          declined: '#ef4444'
        };

        let eventTitle = study.title;
        if (study.location) {
          eventTitle += ` @ ${study.location}`;
        }

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
            description: study.description
          }
        };
      });

    const additionalEvents: EventInput[] = [];
    
    const event1Date = new Date(today);
    event1Date.setDate(today.getDate() + 2);
    event1Date.setHours(10, 0, 0, 0);
    additionalEvents.push({
      id: 'mock-1',
      title: 'Cognitive Behavior Study',
      start: event1Date.toISOString(),
      end: new Date(event1Date.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
      extendedProps: {
        location: 'Psychology Lab A',
        status: 'accepted',
        description: 'Observational study on decision-making patterns in college students'
      }
    });

    const event2Date = new Date(today);
    event2Date.setDate(today.getDate() + 5);
    event2Date.setHours(14, 0, 0, 0);
    additionalEvents.push({
      id: 'mock-2',
      title: 'Social Media Usage Research',
      start: event2Date.toISOString(),
      end: new Date(event2Date.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
      extendedProps: {
        location: 'Research Center B',
        status: 'accepted',
        description: 'Survey-based research on social media habits and mental health'
      }
    });

    const event3Date = new Date(today);
    event3Date.setDate(today.getDate() + 7);
    event3Date.setHours(9, 0, 0, 0);
    additionalEvents.push({
      id: 'mock-3',
      title: 'Memory Formation Study',
      start: event3Date.toISOString(),
      end: new Date(event3Date.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      backgroundColor: '#f59e0b',
      borderColor: '#f59e0b',
      extendedProps: {
        location: 'Neuroscience Lab',
        status: 'pending',
        description: 'EEG study examining memory consolidation during sleep'
      }
    });

    const event4Date = new Date(today);
    event4Date.setDate(today.getDate() + 10);
    event4Date.setHours(11, 0, 0, 0);
    additionalEvents.push({
      id: 'mock-4',
      title: 'Language Processing Research',
      start: event4Date.toISOString(),
      end: new Date(event4Date.getTime() + 2.5 * 60 * 60 * 1000).toISOString(),
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
      extendedProps: {
        location: 'Imaging Center',
        status: 'accepted',
        description: 'fMRI study on bilingual language processing'
      }
    });

    const event5Date = new Date(today);
    event5Date.setDate(today.getDate() + 14);
    event5Date.setHours(13, 30, 0, 0);
    additionalEvents.push({
      id: 'mock-5',
      title: 'Memory Formation Study',
      start: event5Date.toISOString(),
      end: new Date(event5Date.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      extendedProps: {
        location: 'Neuroscience Lab',
        status: 'completed',
        description: 'EEG study examining memory consolidation during sleep'
      }
    });

    return [...studyEvents, ...additionalEvents];
  }, [studies]);

  const handleStudyAction = (studyId: string, action: 'accept' | 'decline') => {
    setStudies(prev => prev.map(study => 
      study.id === studyId 
        ? { ...study, status: action === 'accept' ? 'accepted' : 'declined' }
        : study
    ));
    
    const study = studies.find(s => s.id === studyId);
    toast.success(`Study "${study?.title}" ${action === 'accept' ? 'accepted' : 'declined'}`);
  };

  const getStatusBadge = (status: Study['status'], approved?: boolean) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Accepted</Badge>;
      case 'declined':
        return <Badge variant="outline" className="text-red-600 border-red-600">Declined</Badge>;
      case 'completed':
        if (approved === false) {
          return <Badge variant="outline" className="text-orange-600 border-orange-600">Under Review</Badge>;
        }
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
      default:
        return null;
    }
  };

  const totalHours = studies
    .filter(s => s.status === 'completed' && s.hours)
    .reduce((sum, s) => sum + (s.hours || 0), 0);

  const approvedHours = studies
    .filter(s => s.status === 'completed' && s.hours && s.approved)
    .reduce((sum, s) => sum + (s.hours || 0), 0);

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
              <p className="text-sm text-gray-600">Research Assistant Portal</p>
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
            <p className="text-gray-600 mb-4">{user.email}</p>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-indigo-600">{totalHours}</div>
                <div className="text-sm text-gray-600">Total Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-600">{approvedHours}</div>
                <div className="text-sm text-gray-600">Approved Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-600">
                  {studies.filter(s => s.status === 'accepted').length}
                </div>
                <div className="text-sm text-gray-600">Active Studies</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="studies" className="space-y-6">
          <TabsList>
            <TabsTrigger value="studies">My Studies</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="hours">Hours Log</TabsTrigger>
          </TabsList>

          <TabsContent value="studies" className="space-y-4">
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
                      {getStatusBadge(study.status, study.approved)}
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
                        {study.time} ({study.duration}h)
                      </div>
                      <div>📍 {study.location}</div>
                    </div>
                    
                    {study.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleStudyAction(study.id, 'accept')}
                          className="gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStudyAction(study.id, 'decline')}
                          className="gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </Button>
                      </div>
                    )}

                    {study.status === 'completed' && study.approved === false && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                        Hours logged ({study.hours}h) - Awaiting admin approval
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView events={calendarEvents} height={600} />
          </TabsContent>

          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Availability</CardTitle>
                <CardDescription>
                  Your current availability for research study assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availabilitySlots.map((slot) => (
                    <div key={slot.day} className="flex items-center justify-between py-3 border-b">
                      <div className="font-medium">{slot.day}</div>
                      <div className="flex gap-2">
                        {slot.times.map((time, index) => (
                          <Badge key={index} variant="secondary">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-6">Update Availability</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Hours Log</CardTitle>
                <CardDescription>
                  Track your completed study hours and approval status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studies
                    .filter(s => s.status === 'completed')
                    .map((study) => (
                      <div key={study.id} className="flex items-center justify-between py-3 border-b">
                        <div>
                          <div className="font-medium">{study.title}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(study.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">{study.hours}h</div>
                          </div>
                          {study.approved ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}