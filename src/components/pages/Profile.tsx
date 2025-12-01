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
import { roleTabs } from "../utils/Users";
import { MyStudiesView } from "../views/MyStudiesView";
import { AvailabilityView } from "../views/AvailabilityView";
import { HoursLogView } from "../views/HoursLogView";
import { StudiesView } from '../views/StudiesView';
import { ResearchAssistantsView } from '../views/ResearchAssistantsView';
import { UsersView } from '../views/UsersView';

export function Profile({ user, onLogout }) {
  const tabs = roleTabs[user.role];  
  const [activeTab, setActiveTab] = useState(tabs[0].value);

  const renderTab = (value, user) => {
    switch (value) {
        case "mystudies": return <MyStudiesView user={user} />;
        case "mycalendar": return <CalendarView user={user} filter="user" height={600} />
        case "hours": return <HoursLogView user={user} />;
        case "studycalendar": return <CalendarView user={user} filter="full" height={600} />
        case "studiesmanagement": return <StudiesView user={user} />;
        case "reseachassistants": return <ResearchAssistantsView />;
        case "usermanagment": return <UsersView user={user} />
        case "availability" : return < AvailabilityView user={user}/>;
        default: return null;
    }
}

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">C</span>
            </div>
            <div>
            <h1 className="text-xl font-semibold">CORAL</h1>
            <p className="text-sm text-gray-600">Dashboard</p>
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
            </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
                {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                    </TabsTrigger>
                    
                ))}
            </TabsList>
            
            {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                    {renderTab(tab.value, user)}
                </TabsContent>
            ))}
        </Tabs>
    </div>      
    </div>
  );
}