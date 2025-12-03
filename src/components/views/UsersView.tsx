import React, { useEffect, useState } from 'react';
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
  RotateCcw,
  MapPin,
  Link
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { User } from '../utils/Users';
import type { ScheduleConflict } from '../utils/scheduling-utils';
import { autoAssignRA, checkScheduleConflict } from '../utils/scheduling-utils';
import { CalendarView } from '../views/CalendarView';
import type { EventInput } from '@fullcalendar/core';
import type { Study, ResearchAssistant} from "../utils/interfaces";
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
const formatDateTime = (iso: string) => new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export function UsersView ({ user }: { user: User }) {
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [ras, setRas] = useState<ResearchAssistant[]>(mockRAs)
    const [sonaSchedules, setSonaSchedules] = useState<SonaSchedule[]>([]);
    const [newUser, setNewUser] = useState({
        id: '',
        name: '',
        email: '',
        role: 'ra' as 'ra' | 'scheduling_admin' | 'full_admin',
        tempPassword: ''
    });

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

          const data: SonaSchedule[] = await response.json();
          setSonaSchedules(data);
        } catch (error) {
          console.error('Failed to load SONA schedules', error);
          toast.error('Unable to load SONA schedules right now.');
        }
      };

      fetchSonaSchedules();
    }, []);

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


    return (
        <div>
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

                <Card>
                  <CardHeader>
                    <CardTitle>SONA Schedules (Next 3 Weeks)</CardTitle>
                    <CardDescription>
                      Live pull from SONA for the next 21 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sonaSchedules.length === 0 ? (
                      <div className="text-sm text-gray-600">
                        No schedules returned for the selected window yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sonaSchedules.map((slot) => (
                          <div
                            key={`${slot.experimentId}-${slot.timeslotId}`}
                            className="border rounded-lg p-4 flex flex-col gap-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                <div className="font-semibold">{slot.studyName}</div>
                              </div>
                              <Badge variant="outline">{formatDateTime(slot.timeslotDate)}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span>{slot.durationMinutes} min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span>{slot.location || 'TBD'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span>{slot.numSignedUp}/{slot.numStudents} signed up</span>
                              </div>
                              {slot.videoconfFlag === 1 && slot.videoconfUrl && (
                                <div className="flex items-center gap-1">
                                  <Link className="w-4 h-4 text-gray-500" />
                                  <a
                                    href={slot.videoconfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-600 hover:underline"
                                  >
                                    Join link
                                  </a>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Timeslot ID: {slot.timeslotId} • Experiment ID: {slot.experimentId}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
        </div>
    )
}
