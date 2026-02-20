/**
 * Calendar integration utilities
 * Provides functions to create and share calendar events that work on mobile and desktop
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  url?: string;
}

/**
 * Generate an .ics (iCalendar) file content from event data
 * This works on all platforms - mobile and desktop
 */
export function generateICSFile(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const formatDateAllDay = (date: Date): string => {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  };

  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const start = event.allDay ? formatDateAllDay(event.startDate) : formatDate(event.startDate);
  const end = event.allDay ? formatDateAllDay(event.endDate) : formatDate(event.endDate);
  const dtstamp = formatDate(new Date());

  let ics = 'BEGIN:VCALENDAR\r\n';
  ics += 'VERSION:2.0\r\n';
  ics += 'PRODID:-//ASVA Drive//Calendar Event//EN\r\n';
  ics += 'CALSCALE:GREGORIAN\r\n';
  ics += 'METHOD:PUBLISH\r\n';
  ics += 'BEGIN:VEVENT\r\n';
  ics += `UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@asvadrive.com\r\n`;
  ics += `DTSTAMP:${dtstamp}\r\n`;
  ics += `DTSTART${event.allDay ? ';VALUE=DATE' : ''}:${start}\r\n`;
  ics += `DTEND${event.allDay ? ';VALUE=DATE' : ''}:${end}\r\n`;
  ics += `SUMMARY:${escapeText(event.title)}\r\n`;
  
  if (event.description) {
    ics += `DESCRIPTION:${escapeText(event.description)}\r\n`;
  }
  
  if (event.location) {
    ics += `LOCATION:${escapeText(event.location)}\r\n`;
  }
  
  if (event.url) {
    ics += `URL:${event.url}\r\n`;
  }
  
  ics += 'STATUS:CONFIRMED\r\n';
  ics += 'SEQUENCE:0\r\n';
  ics += 'END:VEVENT\r\n';
  ics += 'END:VCALENDAR\r\n';

  return ics;
}

/**
 * Download an .ics file (works on all platforms)
 * On mobile, this will typically open in the calendar app
 */
export function downloadICSFile(event: CalendarEvent, filename?: string): void {
  const icsContent = generateICSFile(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Share calendar event using Web Share API 
 * On mobile devices, this opens the native share sheet where users can
 * select their calendar app to add the event
 */
export async function shareCalendarEvent(event: CalendarEvent): Promise<boolean> {
  if (!('share' in navigator)) {
    // Fallback to downloading .ics file if Web Share API is not available
    downloadICSFile(event);
    return false;
  }

  try {
    // Create a text representation of the event for sharing
    const eventText = [
      event.title,
      event.startDate.toLocaleString(),
      event.endDate.toLocaleString(),
      event.location,
      event.description,
    ]
      .filter(Boolean)
      .join('\n');

    // Try to share with Web Share API
    // On mobile, users can select calendar apps from the share sheet
    await navigator.share({
      title: event.title,
      text: eventText,
      url: event.url || window.location.href,
    });

    return true;
  } catch (error: any) {
    // User cancelled or error occurred
    if (error.name !== 'AbortError') {
      console.error('Error sharing calendar event:', error);
      // Fallback to downloading .ics file
      downloadICSFile(event);
    }
    return false;
  }
}

/**
 * Add event to calendar - tries Web Share API first, falls back to .ics download
 * This is the recommended function to use as it works on both mobile and desktop
 */
export async function addToCalendar(event: CalendarEvent): Promise<void> {
  // Check if we're on mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile && 'share' in navigator) {
    // Try Web Share API on mobile first
    const shared = await shareCalendarEvent(event);
    if (shared) {
      return; // Successfully shared
    }
  }
  
  // Fallback to .ics file download 
  downloadICSFile(event);
}

/**
 * Create a calendar event URL
 * Note: This is platform-specific and may not work on all devices
 */
export function createCalendarURL(event: CalendarEvent): string | null {
  // Google Calendar URL
  const googleParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${event.startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${event.endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    details: event.description || '',
    location: event.location || '',
  });
  
  return `https://calendar.google.com/calendar/render?${googleParams.toString()}`;
}

