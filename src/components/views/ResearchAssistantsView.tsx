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
import { mockRAs, mockStudies } from '../utils/mock-data';

export function ResearchAssistantsView () {

    const [ras, setRas] = useState<ResearchAssistant[]>(mockRAs)
    return (
        <div>
            <Card>
              <CardHeader>
                <CardTitle>Research Assistants</CardTitle>
                <CardDescription>
                  View and manage your research assistant team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ras.map((ra) => (
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
        </div>
    )
}