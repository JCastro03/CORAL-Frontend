export type UserRole = 'ra' | 'scheduling_admin' | 'full_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export const roleTabs = {
  ra: [
    { value: "mystudies", label: "My Studies" },
    { value: "mycalendar", label: "Personal Calendar" },
    { value: "availability", label: "Availability" },
    { value: "hours", label: "Hours Log" },
  ],

  scheduling_admin: [
    { value: "mystudies", label: "My Studies" },
    { value: "mycalendar", label: "Personal Calendar" },
    { value: "availability", label: "Availability" },
    { value: "hours", label: "Hours Log" },
    { value: "studiesmanagement", label: "Study Managment" },
    { value: "studycalendar", label: "Study Calendar" },
    { value: "reseachassistants", label: "Research Assistants" },
  ],

  full_admin: [
    { value: "studiesmanagement", label: "Study Managment" },
    { value: "studycalendar", label: "Study Calendar" },
    { value: "reseachassistants", label: "Research Assistants" },
    { value: "hourlogs", label: "Hour Logs" },
    { value: "usermanagment", label: "User Management" },
  ]
} as const;