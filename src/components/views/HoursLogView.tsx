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

export function HoursLogView ({ user }: { user: User }) {

    const [studies, setStudies] = useState<Study[]>(
        mockStudies.filter(study => study.assignedRA === user.name)
    );

    return (
        <div>
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
                            {/* <div className="font-medium">{study.hours}h</div> */}
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
        </div>
    )
}