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

interface CalendarViewProps {
  user : User
  filter: string
  height?: string | number;
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

  const handleDateClick = (clickInfo: DateClickArg) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView('timeGridDay', clickInfo.dateStr);
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
              selectable={false}
              dayMaxEvents={true}
            />
        </CardContent>
      </Card>
    </div>
  );
}