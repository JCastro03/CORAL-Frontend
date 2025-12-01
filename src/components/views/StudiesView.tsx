import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Users, Calendar, Clock, CheckCircle, XCircle, AlertCircle, LogOut, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../utils/Users';
import { Input } from '../ui/input';
import { minutesToTime, timeToMinutes } from '../utils/scheduling-utils';
import { CalendarView } from '../views/CalendarView';
import type { EventInput } from '@fullcalendar/core';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

import type { Study } from "../utils/interfaces";
import { mockRAs, mockStudies } from '../utils/mock-data';

export function StudiesView ({ user }: { user: User }) {

    const [studies, setStudies] = useState<Study[]>(mockStudies);
    const [newStudy, setNewStudy] = useState({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        assignedRA: '',
        location: '',
    });


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
        </div>
    )
}