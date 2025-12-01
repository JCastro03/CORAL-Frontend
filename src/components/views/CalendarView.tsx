import React, { useState, useMemo, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardContent } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import type { EventInput, EventContentArg, DateClickArg, EventClickArg } from "@fullcalendar/core";
import { checkScheduleConflict } from "../utils/scheduling-utils";
import "./CalendarView.css";
import type { User } from "../utils/Users";
import type { Study } from "../utils/interfaces";
import { mockRAs, mockStudies } from '../utils/mock-data';

interface CalendarViewProps {
  user : User
  filter: string
  height?: string | number;
  ras?: RA[];
  studies?: Array<{
    id: string;
    date: string;
    time: string;
    duration: number;
    assignedRA?: string;
  }>;
  onAssignRA?: (studyId: string, raName: string) => void;
}

export function CalendarView({ user , filter , height = "auto" }: CalendarViewProps) {

  const [studies, setStudies] = useState<Study[]>(
    filter !== "user"
    ? mockStudies
    : mockStudies.filter(study => study.assignedRA === user.name)
  );
  

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

  const calendarRef = useRef<FullCalendar>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null);
  const [availableRAs, setAvailableRAs] = useState<Array<{ ra: RA; conflict: any }>>([]);
  const [showAvailability, setShowAvailability] = useState<boolean>(false);
  const [availabilityScope, setAvailabilityScope] = useState<'all' | string>('all');
  const [currentView, setCurrentView] = useState<string>('dayGridMonth');

  const handleDateClick = (clickInfo: DateClickArg) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView('timeGridDay', clickInfo.dateStr);
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const view = clickInfo.view;
    const event = clickInfo.event;

    // Ignore clicks on availability blocks
    if (event.extendedProps.type === 'availability') return;
    // Only open assignment for unassigned studies
    if (event.extendedProps && event.extendedProps.assignedRA) return;

    if (ras.length > 0) {
      openAssignModalForEvent(event, view.type, clickInfo);
    }
  };

  const openAssignModalForEvent = (
    event: EventClickArg['event'],
    viewType?: string,
    originalClick?: EventClickArg
  ) => {
    const eventStart = event.start;
    if (!eventStart) return;

    // Ensure day view for better context when launched from click
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi && viewType && viewType !== 'timeGridDay') {
      calendarApi.changeView('timeGridDay', eventStart);
    }

    const eventDate = eventStart.toISOString().split('T')[0];
    const hours = eventStart.getHours();
    const minutes = eventStart.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    const eventTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;

    let duration = 0;
    if (event.end && event.start) {
      duration = Math.round(((event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)) * 10) / 10;
    }

    const raConflicts = ras.map(ra => {
      const conflict = checkScheduleConflict(
        eventDate,
        eventTime,
        duration,
        ra.availability,
        studies.map(s => ({
          date: s.date,
          time: s.time,
          duration: s.duration,
          assignedRA: s.assignedRA
        })),
        ra.name
      );
      return { ra, conflict };
    });

    setAvailableRAs(raConflicts);
    // Reuse the EventClickArg if provided so Dialog has id, else craft a minimal shape with current view
    if (originalClick) {
      setSelectedEvent(originalClick);
    } else {
      const api = calendarRef.current?.getApi();
      const view = api?.view as any;
      setSelectedEvent({ event, view } as unknown as EventClickArg);
    }
  };

  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    const updateSlotHeights = () => {
      const currentView = calendarApi.view.type;
      
      if (currentView === 'timeGridWeek') {
        const weekViewSlots = document.querySelectorAll('.fc-timeGridWeek-view .fc-timegrid-slot');
        const weekViewSlotLanes = document.querySelectorAll('.fc-timeGridWeek-view .fc-timegrid-slot-lane');
        
        weekViewSlots.forEach((slot) => {
          (slot as HTMLElement).style.removeProperty('height');
          (slot as HTMLElement).style.removeProperty('min-height');
          (slot as HTMLElement).style.removeProperty('max-height');
          (slot as HTMLElement).style.removeProperty('line-height');
        });
        
        weekViewSlotLanes.forEach((lane) => {
          (lane as HTMLElement).style.removeProperty('height');
          (lane as HTMLElement).style.removeProperty('min-height');
        });
      }
      
      if (currentView === 'timeGridDay') {
        const dayViewSlots = document.querySelectorAll('.fc-timeGridDay-view .fc-timegrid-slot:not(.fc-timegrid-slot-minor)');
        const dayViewMinorSlots = document.querySelectorAll('.fc-timeGridDay-view .fc-timegrid-slot-minor');
        const dayViewSlotLanes = document.querySelectorAll('.fc-timeGridDay-view .fc-timegrid-slot-lane:not(.fc-timegrid-slot-minor)');
        const dayViewMinorSlotLanes = document.querySelectorAll('.fc-timeGridDay-view .fc-timegrid-slot-lane.fc-timegrid-slot-minor');
        
        dayViewSlots.forEach((slot) => {
          (slot as HTMLElement).style.setProperty('height', '0.5rem', 'important');
          (slot as HTMLElement).style.setProperty('min-height', '0.5rem', 'important');
          (slot as HTMLElement).style.setProperty('max-height', '0.5rem', 'important');
          (slot as HTMLElement).style.setProperty('line-height', '0.5rem', 'important');
        });
        
        dayViewMinorSlots.forEach((slot) => {
          (slot as HTMLElement).style.setProperty('height', '0.25rem', 'important');
          (slot as HTMLElement).style.setProperty('min-height', '0.25rem', 'important');
          (slot as HTMLElement).style.setProperty('max-height', '0.25rem', 'important');
          (slot as HTMLElement).style.setProperty('line-height', '0.25rem', 'important');
        });
        
        dayViewSlotLanes.forEach((lane) => {
          (lane as HTMLElement).style.setProperty('height', '0.5rem', 'important');
          (lane as HTMLElement).style.setProperty('min-height', '0.5rem', 'important');
        });
        
        dayViewMinorSlotLanes.forEach((lane) => {
          (lane as HTMLElement).style.setProperty('height', '0.25rem', 'important');
          (lane as HTMLElement).style.setProperty('min-height', '0.25rem', 'important');
        });
      }
    };

    calendarApi.on('viewDidMount', updateSlotHeights);
    calendarApi.on('datesSet', updateSlotHeights);
    
    setTimeout(updateSlotHeights, 100);

    return () => {
      calendarApi.off('viewDidMount', updateSlotHeights);
      calendarApi.off('datesSet', updateSlotHeights);
    };
  }, [calendarEvents]);

  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    const updateButtonColors = () => {
      const primaryButtons = document.querySelectorAll('.fc-button-primary:not(.fc-button-active)');
      primaryButtons.forEach((button) => {
        (button as HTMLElement).style.setProperty('background-color', '#030213', 'important');
        (button as HTMLElement).style.setProperty('border-color', '#030213', 'important');
        (button as HTMLElement).style.setProperty('color', '#fff', 'important');
      });
      
      const activeButtons = document.querySelectorAll('.fc-button-active');
      activeButtons.forEach((button) => {
        const isViewButton = button.closest('.fc-button-group');
        if (isViewButton) {
          (button as HTMLElement).style.setProperty('background-color', '#e9ebef', 'important');
          (button as HTMLElement).style.setProperty('border-color', '#e9ebef', 'important');
          (button as HTMLElement).style.setProperty('color', '#030213', 'important');
          (button as HTMLElement).style.setProperty('font-weight', '600', 'important');
        } else {
          (button as HTMLElement).style.setProperty('background-color', '#030213', 'important');
          (button as HTMLElement).style.setProperty('border-color', '#030213', 'important');
          (button as HTMLElement).style.setProperty('color', '#fff', 'important');
        }
      });
    };

    const updateEventMargins = () => {
      // No-op: rely on CSS + FullCalendar layout for widths/placement
    };

    calendarApi.on('viewDidMount', () => {
      setCurrentView(calendarApi.view.type);
      updateButtonColors();
      updateEventMargins();
    });
    calendarApi.on('datesSet', () => {
      setCurrentView(calendarApi.view.type);
      updateButtonColors();
      updateEventMargins();
    });
    calendarApi.on('eventsSet', () => {
      updateEventMargins();
    });

    updateButtonColors();
    updateEventMargins();
    setTimeout(() => {
      updateButtonColors();
      updateEventMargins();
    }, 100);
    setTimeout(() => {
      updateButtonColors();
      updateEventMargins();
    }, 500);

    const observer = new MutationObserver(() => {
      updateButtonColors();
      updateEventMargins();
    });
    const calendarEl = document.querySelector('.fc');
    if (calendarEl) {
      observer.observe(calendarEl, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      calendarApi.off('viewDidMount', updateButtonColors);
      calendarApi.off('datesSet', updateButtonColors);
      calendarApi.off('eventsSet', updateEventMargins);
      observer.disconnect();
    };
  }, [calendarEvents]);

  const renderEventContent = (eventInfo: EventContentArg) => {
    const { timeText, event, view } = eventInfo;
    const title = event.title || "";
    const viewType = view.type;
    const extendedProps = event.extendedProps;
    const isAvailability = extendedProps?.type === 'availability';
    const availableRAs = extendedProps?.availableRAs || [];
    const isUnassigned = !extendedProps?.assignedRA && availableRAs.length > 0;
    
    const isDayView = viewType === 'timeGridDay';
    
    let maxTitleLength = 20;
    if (viewType === 'timeGridWeek') {
      maxTitleLength = 40;
    }
    
    const truncatedTitle = isDayView 
      ? title
      : (title.length > maxTitleLength 
          ? title.substring(0, maxTitleLength) + "..."
          : title);

    // For month view availability, remove the word "Available" and abbreviate first names
    const abbreviateName = (fullName: string) => {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length === 1) return parts[0];
      const first = parts[0];
      const last = parts[parts.length - 1];
      return `${first.charAt(0)}. ${last}`;
    };

    let displayTitle = truncatedTitle;
    if (isAvailability && viewType === 'dayGridMonth') {
      const names: string[] = Array.isArray(extendedProps?.raNames)
        ? extendedProps.raNames
        : (extendedProps?.raName ? [extendedProps.raName] : []);
      if (names.length > 0) {
        const short = names.map(abbreviateName).join(', ');
        displayTitle = short; // Do not prefix with "Available"
      } else {
        // Fallback: keep truncated title but strip leading 'Available - '
        displayTitle = truncatedTitle.replace(/^Available\s*-\s*/i, '');
      }
    }

    return (
      <div className={`fc-event-main-frame flex flex-col w-full min-h-full overflow-hidden box-border ${
        isDayView ? 'px-1 py-0' : 'px-1 py-0.5'
      }`}>
        {timeText && (
          <div className={`fc-event-time text-xs font-semibold whitespace-nowrap overflow-visible shrink-0 leading-tight ${
            isDayView ? 'mb-0' : 'mb-0.5'
          }`}>
            {timeText}
          </div>
        )}
        <div className={`fc-event-title text-xs leading-snug flex-1 min-w-0 ${
          isDayView 
            ? 'overflow-visible whitespace-normal' 
            : 'overflow-hidden text-ellipsis whitespace-nowrap'
        }`}>
          {displayTitle}
        </div>
        {isUnassigned && !isAvailability && (
          <div className={`leading-tight mt-0.5 font-medium ${
            isDayView 
              ? 'text-[10px] overflow-visible whitespace-normal' 
              : viewType === 'dayGridMonth'
              ? 'text-[9px] overflow-hidden text-ellipsis whitespace-nowrap'
              : 'text-[10px] overflow-hidden text-ellipsis whitespace-nowrap'
          }`} style={{ opacity: 0.95 }}>
            Available: {availableRAs.join(', ')}
          </div>
        )}
        {/* Inline Assign button removed to avoid FullCalendar click interference. */}
      </div>
    );
  };

  // Attach native click handler for inline Assign button inside events
  const handleEventDidMount = React.useCallback((info: any) => {
    const el: HTMLElement = info.el;
    const btn = el.querySelector('.coral-assign-btn') as HTMLElement | null;
    if (btn) {
      (btn as any).onclick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        openAssignModalForEvent(info.event, info.view?.type || currentView, info);
      };
    }
  }, [openAssignModalForEvent, currentView]);

  // Build availability overlay events for selected RA(s)
  const availabilityEvents: EventInput[] = React.useMemo(() => {
    if (!showAvailability || ras.length === 0) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rasToShow = availabilityScope === 'all' ? ras : ras.filter(r => r.name === availabilityScope);

    const parseTime = (timeStr: string): { hour: number; minute: number } => {
      const [time, period] = timeStr.trim().split(' ');
      const [hStr, mStr] = time.split(':');
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr || '0', 10);
      let hour = h;
      if (period === 'PM' && h !== 12) hour += 12;
      if (period === 'AM' && h === 12) hour = 0;
      return { hour, minute: m };
    };
    const parseRange = (range: string) => {
      const [start, end] = range.split(' - ');
      return { start: parseTime(start), end: parseTime(end) };
    };
    const dayMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    const getNextDateForDay = (dayName: string, fromDate: Date): Date => {
      const targetDay = dayMap[dayName];
      const currentDay = fromDate.getDay();
      let diff = targetDay - currentDay;
      if (diff < 0) diff += 7;
      const d = new Date(fromDate);
      d.setDate(fromDate.getDate() + diff);
      return d;
    };

    // Group identical time slots across RAs into a single overlay event
    const grouped: Record<string, { start: Date; end: Date; names: string[] } > = {};
    for (let weekOffset = 0; weekOffset < 8; weekOffset++) {
      const baseDate = new Date(today);
      baseDate.setDate(today.getDate() + weekOffset * 7);
      rasToShow.forEach((ra) => {
        ra.availability.forEach((slot, idx) => {
          const [day, ...rest] = slot.split(' ');
          const timeRange = rest.join(' ');
          if (!dayMap.hasOwnProperty(day)) return;
          const dayDate = getNextDateForDay(day, baseDate);
          const { start, end } = parseRange(timeRange);
          const startDate = new Date(dayDate);
          startDate.setHours(start.hour, start.minute, 0, 0);
          const endDate = new Date(dayDate);
          endDate.setHours(end.hour, end.minute, 0, 0);
          if (endDate <= today) return;
          const key = `${startDate.getTime()}|${endDate.getTime()}`;
          if (!grouped[key]) {
            grouped[key] = { start: startDate, end: endDate, names: [] };
          }
          grouped[key].names.push(ra.name);
        });
      });
    }
    const isBg = currentView === 'timeGridDay' || currentView === 'timeGridWeek';

    // Build study intervals by date from incoming events (ignore availability) to subtract overlap
    const studyIntervalsByDate = new Map<string, Array<{ start: Date; end: Date }>>();
    (events || []).forEach((ev: any) => {
      const ext = ev.extendedProps || {};
      if (ext.type === 'availability') return;
      const s = ev.start ? new Date(ev.start) : null;
      const e = ev.end ? new Date(ev.end) : null;
      if (!s || !e) return;
      const dateKey = s.toISOString().split('T')[0];
      if (!studyIntervalsByDate.has(dateKey)) studyIntervalsByDate.set(dateKey, []);
      studyIntervalsByDate.get(dateKey)!.push({ start: s, end: e });
    });

    // Helper to subtract a set of intervals from one interval
    const subtractIntervals = (baseStart: Date, baseEnd: Date, intervals: Array<{start: Date; end: Date}>) => {
      let segments: Array<{ start: Date; end: Date }> = [{ start: baseStart, end: baseEnd }];
      const toMinutes = (d: Date) => d.getTime();
      const sorted = [...intervals].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
      sorted.forEach(iv => {
        const nextSegments: Array<{ start: Date; end: Date }> = [];
        segments.forEach(seg => {
          const segStart = toMinutes(seg.start);
          const segEnd = toMinutes(seg.end);
          const ivStart = toMinutes(iv.start);
          const ivEnd = toMinutes(iv.end);
          // No overlap
          if (ivEnd <= segStart || ivStart >= segEnd) {
            nextSegments.push(seg);
          } else {
            // Overlap exists; split
            if (ivStart > segStart) {
              nextSegments.push({ start: seg.start, end: new Date(iv.start) });
            }
            if (ivEnd < segEnd) {
              nextSegments.push({ start: new Date(iv.end), end: seg.end });
            }
          }
        });
        segments = nextSegments;
      });
      return segments.filter(s => s.end > s.start);
    };

    const overlays: EventInput[] = Object.entries(grouped).flatMap(([key, group]) => {
      const names = group.names.sort((a, b) => a.localeCompare(b));
      // If using background overlays, subtract any overlapping study intervals for that date
      let segments: Array<{ start: Date; end: Date }> = [{ start: group.start, end: group.end }];
      if (isBg) {
        const dateKey = group.start.toISOString().split('T')[0];
        const studyIntervals = studyIntervalsByDate.get(dateKey) || [];
        if (studyIntervals.length > 0) {
          segments = subtractIntervals(group.start, group.end, studyIntervals);
        }
      }
      return segments.map((seg, idx) => ({
        id: `avail-group-${key}-${idx}`,
        title: `Available - ${names.join(', ')}`,
        start: seg.start.toISOString(),
        end: seg.end.toISOString(),
        backgroundColor: '#e5e7eb',
        borderColor: '#9ca3af',
        textColor: '#6b7280',
        classNames: ['availability-slot', 'availability-group'],
        display: isBg ? 'background' : 'block',
        extendedProps: { type: 'availability', raNames: names },
      } as EventInput));
    });
    return overlays;
  }, [showAvailability, availabilityScope, ras, currentView, events]);

  const combinedEvents = React.useMemo(() => {
    if (!showAvailability) return events;
    return [...availabilityEvents, ...events];
  }, [events, availabilityEvents, showAvailability]);

  return (
    <div className="p-4 overflow-visible">
      <Card className="overflow-visible">
        <CardContent className="p-4 overflow-visible">
          {ras.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Show Availability</Label>
              <Button 
                type="button"
                variant={showAvailability ? 'default' : 'outline'}
                onClick={() => setShowAvailability((v) => !v)}
                className="h-8 px-3"
              >
                {showAvailability ? 'On' : 'Off'}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">RA</Label>
              <Select value={availabilityScope} onValueChange={(v) => setAvailabilityScope(v as any)}>
                <SelectTrigger className="w-[200px]" disabled={!showAvailability}>
                  <SelectValue placeholder="Select RA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All RAs</SelectItem>
                  {ras.map((ra) => (
                    <SelectItem key={ra.id} value={ra.name}>{ra.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          )}
          <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              height={height}
              events={calendarEvents}
              eventDisplay="block"
              eventContent={renderEventContent}
              eventDidMount={handleEventDidMount}
              eventTimeFormat={{
                hour: "numeric",
                minute: "2-digit",
                meridiem: "short",
              }}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              slotDuration="00:30:00"
              slotLabelInterval="01:00:00"
              displayEventTime={true}
              displayEventEnd={true}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              selectable={false}
              dayMaxEvents={false}
              eventLimit={false}
            />
        </CardContent>
      </Card>
      
      <Dialog open={selectedEvent !== null} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Research Assistant</DialogTitle>
            <DialogDescription>
              Select an available RA to assign to this study
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4 max-h-[500px] overflow-y-auto">
            {availableRAs.map(({ ra, conflict }) => {
              const isAvailable = conflict.reason === 'available';
              const studyId = selectedEvent?.event.id;
              
              return (
                <div 
                  key={ra.id} 
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isAvailable 
                      ? 'border-green-200 bg-green-50/50 hover:border-green-300 hover:bg-green-50' 
                      : conflict.reason === 'conflict'
                      ? 'border-orange-200 bg-orange-50/50'
                      : 'border-gray-200 bg-gray-50/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                      <AvatarImage src={ra.avatar} alt={ra.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                        {ra.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-gray-900">{ra.name}</h3>
                        {isAvailable && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 text-green-700 border-green-300 bg-green-100">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Available
                          </Badge>
                        )}
                        {conflict.reason === 'conflict' && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 text-orange-700 border-orange-300 bg-orange-100">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Conflict
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-2">{ra.email}</div>
                      
                      {(ra.totalHours !== undefined || ra.pendingHours !== undefined) && (
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          {ra.totalHours !== undefined && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-3 h-3" />
                              <span>{ra.totalHours}h total</span>
                            </div>
                          )}
                          {ra.pendingHours !== undefined && ra.pendingHours > 0 && (
                            <div className="flex items-center gap-1 text-amber-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              <span>{ra.pendingHours}h pending</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {!isAvailable && (
                        <div className={`text-xs mt-2 ${
                          conflict.reason === 'conflict'
                            ? 'text-orange-600'
                            : 'text-gray-600'
                        }`}>
                          {conflict.reason === 'conflict' && `⚠️ ${conflict.conflictDetails}`}
                          {conflict.reason === 'unavailable' && `❌ ${conflict.conflictDetails}`}
                        </div>
                      )}
                    </div>
                    
                    {isAvailable && onAssignRA && studyId && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onAssignRA(studyId as string, ra.name);
                          setSelectedEvent(null);
                        }}
                        className="shrink-0 bg-green-600 hover:bg-green-700 text-white z-10 relative"
                        type="button"
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {availableRAs.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="font-medium">No RAs available</p>
                <p className="text-sm text-gray-400 mt-1">No research assistants are available for this timeslot</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
