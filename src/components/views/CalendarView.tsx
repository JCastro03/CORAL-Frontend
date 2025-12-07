import React, { useState, useMemo, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardContent } from "../ui/card";
import type { EventInput, EventContentArg, DateClickArg } from "@fullcalendar/core";
import "./CalendarView.css";
import type { User } from "../utils/Users";
import type { Study } from "../utils/interfaces";
import { mockRAs, mockStudies } from '../utils/mock-data';
import { toast } from "sonner";

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
  site?: string;
  timeline: {
    timeslot_date: string;
  };
};

const formatDateParam = (date: Date) => date.toISOString().split("T")[0];
const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60000);

interface CalendarViewProps {
  user : User
  filter: string
  height?: string | number;
}

export function CalendarView({ user , filter , height = "auto" }: CalendarViewProps) {

  const [studies, setStudies] = useState<Study[]>([]);
  const [calendarRange, setCalendarRange] = useState<{ start: string; end: string } | null>(null);
  

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

  const handleDateClick = (clickInfo: DateClickArg) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView('timeGridDay', clickInfo.dateStr);
    }
  };

  const handleDatesSet = (arg: { startStr: string; endStr: string }) => {
    setCalendarRange({ start: arg.startStr, end: arg.endStr });
  };

  useEffect(() => {
    if (!calendarRange) return;

    const fetchSonaSchedules = async () => {
      const startDate = new Date(calendarRange.start);
      const endDate = new Date(calendarRange.end);

      const startParam = formatDateParam(startDate);
      const endParam = formatDateParam(endDate);
      const url = `http://127.0.0.1:8000/api/studies/sona-schedules/?start_date=${startParam}&end_date=${endParam}`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const raw = await response.json();
        const data: SonaSchedule[] = Array.isArray(raw)
          ? raw
          : (raw?.results as SonaSchedule[]) ||
            (raw?.data as SonaSchedule[]) ||
            [];

        const mappedStudies: Study[] = data.map((slot) => {
          const timeslotDate = slot.timeslotDate || (slot as any).timeslot_date || slot.timeline?.timeslot_date;
          const start = timeslotDate ? new Date(timeslotDate) : new Date();
          const end = addMinutes(start, slot.durationMinutes || 60);

          return {
            id: `${slot.experimentId}-${slot.timeslotId}`,
            title: slot.studyName || "SONA Study",
            description: `Timeslot ${slot.timeslotId}`,
            date: timeslotDate || slot.timeslotDate,
            startTime: formatTime(start),
            endTime: formatTime(end),
            location: slot.location || "TBD",
            assignedRA: "",
            status: "open",
            site: slot.site,
            experimentId: slot.experimentId,
            timeslotId: slot.timeslotId,
            durationMinutes: slot.durationMinutes ?? 0,
            numSignedUp: slot.numSignedUp,
            numStudents: slot.numStudents,
            surveyFlag: slot.surveyFlag,
            webFlag: slot.webFlag,
            videoconfFlag: slot.videoconfFlag,
            videoconfUrl: slot.videoconfUrl,
            timelineDate: slot.timeline?.timeslot_date,
          };
        });

        const filteredStudies =
          filter === "user"
            ? mappedStudies.filter((study) => study.assignedRA === user.name)
            : mappedStudies;

        setStudies(filteredStudies);
      } catch (error) {
        console.error("Failed to load SONA schedules", error);
        toast.error("Unable to load SONA schedules right now.");
        const fallback =
          filter === "user"
            ? mockStudies.filter((study) => study.assignedRA === user.name)
            : mockStudies;
        setStudies(fallback);
      }
    };

    fetchSonaSchedules();
  }, [calendarRange, filter, user.name]);

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
      const dayViewEvents = document.querySelectorAll('.fc-timeGridDay-view .fc-timegrid-event');
      dayViewEvents.forEach((event) => {
        (event as HTMLElement).style.removeProperty('left');
        (event as HTMLElement).style.removeProperty('right');
        (event as HTMLElement).style.setProperty('margin-left', '2px', 'important');
        (event as HTMLElement).style.setProperty('margin-right', '2px', 'important');
        (event as HTMLElement).style.setProperty('width', 'calc(100% - 4px)', 'important');
      });
      
      const dayViewHarnesses = document.querySelectorAll('.fc-timeGridDay-view .fc-timegrid-event-harness');
      dayViewHarnesses.forEach((harness) => {
        (harness as HTMLElement).style.setProperty('left', '0', 'important');
        (harness as HTMLElement).style.setProperty('right', '0', 'important');
        (harness as HTMLElement).style.setProperty('width', '100%', 'important');
      });
    };

    calendarApi.on('viewDidMount', () => {
      updateButtonColors();
      updateEventMargins();
    });
    calendarApi.on('datesSet', () => {
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
          {truncatedTitle}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <Card>
        <CardContent className="p-4">
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
              datesSet={handleDatesSet}
              selectable={false}
              dayMaxEvents={true}
            />
        </CardContent>
      </Card>
    </div>
  );
}
