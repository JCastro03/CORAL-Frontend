import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, Calendar, Clock, MapPin, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../utils/Users';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

import type { Study } from "../utils/interfaces";
import { mockRAs, mockStudies } from '../utils/mock-data';

type SonaSchedule = {
  experimentId: number;
  studyName: string;
  timeslotId: number;
  timeslotDate: string;
  durationMinutes: number;
  location: string;
  numSignedUp: number;
  numStudents: number;
  researcherId: number;
  surveyFlag: number;
  webFlag: number;
  videoconfFlag: number;
  videoconfUrl: string | null;
  timeline: {
    timeslot_date: string;
  };
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];
const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60000);

export function StudiesView ({ user }: { user: User }) {
    const [studies, setStudies] = useState<Study[]>([]);
    const [selectedRAByStudy, setSelectedRAByStudy] = useState<Record<string, string>>({});

    useEffect(() => {
      const fetchSonaSchedules = async () => {
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + 21);

        const startParam = formatDate(today);
        const endParam = formatDate(endDate);
        const url = `http://127.0.0.1:8000/api/studies/sona-schedules/?start_date=${startParam}&end_date=${endParam}`;

        try {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }

          const raw = await response.json();
          console.log('SONA schedules response', raw);
          const data: SonaSchedule[] = Array.isArray(raw)
            ? raw
            : (raw?.results as SonaSchedule[]) ||
              (raw?.data as SonaSchedule[]) ||
              [];

          const mappedStudies: Study[] = data.map((slot) => {
            const timeslotDate = slot.timeslotDate || (slot as any).timeslot_date || slot.timeline?.timeslot_date;
            const startDate = timeslotDate ? new Date(timeslotDate) : new Date();
            const end = addMinutes(startDate, slot.durationMinutes || 60);

            return {
              id: `${slot.experimentId}-${slot.timeslotId}`,
              title: slot.studyName || 'SONA Study',
              description: `Timeslot ${slot.timeslotId}`,
              date: timeslotDate || slot.timeslotDate,
              startTime: formatTime(startDate),
              endTime: formatTime(end),
              location: slot.location || 'TBD',
              assignedRA: '',
              status: 'open',
              experimentId: slot.experimentId,
              timeslotId: slot.timeslotId,
              durationMinutes: slot.durationMinutes ?? 0,
              numSignedUp: slot.numSignedUp,
              numStudents: slot.numStudents,
              surveyFlag: slot.surveyFlag,
              webFlag: slot.webFlag,
              videoconfFlag: slot.videoconfFlag,
              videoconfUrl: slot.videoconfUrl,
              timelineDate: slot.timeline?.timeslot_date
            };
          });
          setStudies(mappedStudies);
        } catch (error) {
          console.error('Failed to load SONA schedules', error);
          toast.error('Unable to load SONA schedules right now.');
          setStudies(mockStudies);
        }
      };

      fetchSonaSchedules();
    }, []);

    const handleAssignRA = (studyId : string, selectedRA: string) => {
      if (!selectedRA) {
        toast.error('Please select a Research Assistant first.');
        return;
      }

      setStudies(prev => {
        return prev.map((study) =>
          study.id === studyId
            ? { ...study, assignedRA: selectedRA, status: 'assigned' }
            : study
        );
      });
      toast.success(`Successfully assigned ${selectedRA}`);
    }


    const getStatusBadge = (status: Study['status'], approved?: boolean) => {
        switch (status) {
            case 'pending':
            return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
            case 'assigned':
            return <Badge variant="outline" className="text-blue-600 border-blue-600">Assigned</Badge>;
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

    return (
        <div>
            <div className="grid gap-4">
              {studies.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-sm text-gray-600">
                    No SONA studies found for the next 21 days.
                  </CardContent>
                </Card>
              ) : (
              studies.map((study) => {
                const selectedRA = selectedRAByStudy[study.id] || "";

                return (
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
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
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
                        {study.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {study.location}
                          </div>
                        )}
                        {study.assignedRA && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {study.assignedRA}
                          </div>
                        )}
                        {(study.numSignedUp !== undefined || study.numStudents !== undefined) && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{study.numSignedUp ?? 0}/{study.numStudents ?? 0} signed up</span>
                          </div>
                        )}
                        {study.videoconfFlag === 1 && study.videoconfUrl && (
                          <div className="flex items-center gap-1">
                            <LinkIcon className="w-4 h-4" />
                            <a
                              href={study.videoconfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline"
                            >
                              Join link
                            </a>
                          </div>
                        )}
                      </div>

                      <div className='flex items-center'>
                        { !study.assignedRA && (
                            <div className="flex items-center gap-2">
                              <Select 
                                value={selectedRA}
                                onValueChange={(value) =>
                                  setSelectedRAByStudy((prev) => ({ ...prev, [study.id]: value }))
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

                                  </SelectContent>
                              </Select>
                              <Button 
                                onClick={() => handleAssignRA(study.id, selectedRA)}
                                className="gap-2">
                                Confirm
                              </Button> 
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                );
              }))}
            </div>
        </div>
    )
}
