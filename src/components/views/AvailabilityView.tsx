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

type TimeRange = {
  start: string;
  end: string;
}

type DayAvailability = {
  day: string;
  times: TimeRange[];
  newStart?: string;
  newEnd?: string;
  error?: string;
}

const mockAvailabilitySlots = [
  { day: 'Monday', times: [{start:"9:00 AM", end: "12:00 PM"}, {start:"2:00 PM", end:"5:00 PM"}] },
  { day: 'Tuesday', times: [{start:"10:00 AM", end: "1:00 PM"}] },
  { day: 'Wednesday', times: [{start:"9:00 AM", end: "12:00 PM"}, {start:"1:00 PM", end:"4:00 PM"}] },
  { day: 'Thursday', times: [{start:"10:00 AM", end: "2:00 PM"}] },
  { day: 'Friday', times: [{start:"9:00 AM", end: "11:00 AM"}] }
];


export function AvailabilityView ({ user }: { user: User }) {

    const [isUpdatingAvailability, setUpdatingAvailability] = useState(false);
    const [availabilitySlots, setAvailabilitySlots] = useState<DayAvailability[]>(mockAvailabilitySlots);

    const updateTime = (dayIndex: number, field: "start" | "end", value: string) => {
        setAvailabilitySlots(prev => {
            const updated = [...prev];
            updated[dayIndex] = {
            ...updated[dayIndex],
            [field === "start" ? "newStart" : "newEnd"]: value,
            error: ""
            }
            return updated;
        });
    };
    
    const addSlot = (dayIndex: number) => {
        setAvailabilitySlots(prev => {
          const updated = [...prev];
          
          const day = updated[dayIndex];
    
          if(!day.newStart || !day.newEnd) {
            day.error = "Start Time and End Time is required.";
            return updated;
          }
    
          const newStartMins = timeToMinutes(day.newStart)
          const newEndMins = timeToMinutes(day.newEnd)
          
          console.log(newStartMins)
          console.log(newEndMins)
    
          if (newStartMins >= newEndMins) {
            day.error =  "Start Time must be before End Time.";
            return updated;
          }
    
          const hasConflict = day?.times.some((slot) => {
            const slotStart = timeToMinutes(slot.start)
            const slotEnd = timeToMinutes(slot.end)
    
            return newStartMins < slotEnd && newEndMins > slotStart;
    
          })
    
          if (hasConflict) {
            day.error = "New timeslot conflicts with exsisting timeslots";
            return updated
          }
          
          day.times = [...day?.times,
            {
              start: minutesToTime(newStartMins),
              end: minutesToTime(newEndMins)
            }
          ]
    
          day.newStart = "";
          day.newEnd = "";
          day.error = "";
    
          updated[dayIndex] = day
    
          return updated;
        });
      };
    
    const handleDeleteTimeSLot = (dayIndex: number, timeIndex: number) => {
    setAvailabilitySlots(prev => {
        const updated = [...prev];

        updated[dayIndex] = {
        ...updated[dayIndex],
        times: updated[dayIndex].times.filter((_, i) => i !== timeIndex) 
        }
        return updated
    })

    }
    
    const handleUpdateAvailability = () => {
    setUpdatingAvailability(false)
    console.log("API call to send updated availability object to DB. ")

    toast.success("Successfully Updated Availability!")
    }

    return (
        <div>
        { !isUpdatingAvailability && (
            <Card>
            <CardHeader>
                <CardTitle>Weekly Availability</CardTitle>
                <CardDescription>
                Your current availability for research study assignments
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space -y-4">
                {availabilitySlots.map((slot) => (
                    <div key={slot.day} className="flex items-center justify-between py-3 border-b">
                    <div className="font-medium">{slot.day}</div>
                    <div className="h-8 flex gap-2">
                        {slot.times.map((time, index) => (
                        <Badge key={index} variant="secondary">
                            {time.start}-{time.end}
                        </Badge>
                        ))}
                    </div>
                    </div>
                ))}
                </div>
                <Button 
                className="mt-6"
                onClick={() => setUpdatingAvailability(true)}
                >
                Edit
                </Button>
            </CardContent>
            </Card>
        )}

        { isUpdatingAvailability && (
            <Card>
            <CardHeader>
                <CardTitle>Update Availability</CardTitle>
                <CardDescription>Description for the form.</CardDescription>
            </CardHeader>

            <CardContent>
                <form>
                { availabilitySlots.map((slot, dayIndex) => (
                    <div key={slot.day} className="flex items-center justify-between py-3 border-b">
                    
                    <div className="flex flex-col gap-3">
                        <div className="font-medium">{slot.day}</div>
                        {slot.error && (
                        <span className="text-red-600 text-sm mt-1">{slot.error}</span>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-3 w-fit self-end">

                        {slot.times.map((time, timeIndex) => (
                        <div
                            key={timeIndex}
                            className="flex items-center gap-2 w-fit"
                        >
                            <Badge key={timeIndex} variant="secondary" className="h-8 flex items-center">
                            {time.start}-{time.end}
                            </Badge>

                            <Button 
                            type="button"
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteTimeSLot(dayIndex, timeIndex)}
                            className="gap-1"
                            >
                            <XCircle className="w-4 h-4" />
                            Delete
                            </Button>
                        </div>  
                        
                        ))}

                        <div className="flex items-center gap-2 w-fit">
                        <Input 
                            id="startTime"
                            type="time"
                            value={slot.newStart || ''}
                            onChange={(e) => updateTime(dayIndex, "start", e.target.value)}
                            className="w-32"
                        />
                        <span> - </span>
                        <Input
                            id="endTime"
                            type="time"
                            value={slot.newEnd || ''}
                            onChange={(e) => updateTime(dayIndex, "end", e.target.value)}
                            className="w-32"
                        />
                        </div>

                    
                        <Button 
                        type="button"
                        size="sm" 
                        variant="ghost"
                        onClick={() => addSlot(dayIndex)}
                        className="text-blue-600 hover:text-blue-800 self-end"
                        >
                        <PlusCircle className="w-4 h-4" />
                        Add Time Slot
                        </Button>
                    </div>
                    </div>
                ))}

                </form>
                <Button 
                size = "sm"
                variant="ghost"
                className="mt-6 text-blue-600 hover:text-blue-800 gap-2"
                onClick={()=> handleUpdateAvailability()}
                >
                Update Availability
                </Button>
                <Button 
                size="sm" 
                variant="destructive"
                onClick={() => setUpdatingAvailability(false)}
                className="gap-1"
                >
                Cancel
                </Button>
            </CardContent>

            
            </Card>
        )}
        </div>

        
    )
}