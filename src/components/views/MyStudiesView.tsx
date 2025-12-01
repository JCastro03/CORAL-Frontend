import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, LogOut, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../utils/Users';
import { Input } from '../ui/input';
import { minutesToTime, timeToMinutes } from '../utils/scheduling-utils';
import { CalendarView } from '../views/CalendarView';
import type { EventInput } from '@fullcalendar/core';
import type { Study } from "../utils/interfaces";
import { mockRAs, mockStudies } from '../utils/mock-data';

export function MyStudiesView ({ user }: { user: User }) {

    const [studies, setStudies] = useState<Study[]>(
        mockStudies.filter(study => study.assignedRA === user.name)
    );

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
                        {study.startTime} - {study.endTime}
                      </div>
                      <div>📍 {study.location}</div>
                    </div>
                    
                    {study.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          // onClick={() => handleStudyAction(study.id, 'accept')}
                          className="gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          // onClick={() => handleStudyAction(study.id, 'decline')}
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
                        {/* Hours logged ({study.hours}h) - Awaiting admin approval */}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>
    )
}