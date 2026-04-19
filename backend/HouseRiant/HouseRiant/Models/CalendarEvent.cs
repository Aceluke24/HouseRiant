namespace HouseRhiant.Api.Models;

public enum CalendarEventType
{
    Deadline,
    Battle,
    Festival,
    TaskEvent,
    Note,
    Other
}

public class CalendarEvent
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public CalendarEventType Type { get; set; } = CalendarEventType.Note;

    // Date components
    public int Year { get; set; }
    public string Season { get; set; } = string.Empty;  // e.g. "Ambrik's Thaw" or "Brón: Bás"
    public string? Week { get; set; }                   // null for Brón weeks
    public int Day { get; set; }                        // 1-9

    // Human readable + sort
    public string DisplayDate { get; set; } = string.Empty; // "5th of Iianu of Ambrik's Thaw"
    public int SortOrder { get; set; }                  // for chronological ordering

    public string? Notes { get; set; }

    // Short display label for the calendar grid (optional; falls back to Name)
    public string? ShortLabel { get; set; }

    // End date for multi-day events (null = single-day)
    public string? EndWeek { get; set; }   // null for Brón or single-day
    public int? EndDay { get; set; }       // 1-9, null = same day as Day

    public int? LinkedTaskId { get; set; }
    public EstateTask? LinkedTask { get; set; }

    // Recurring events: all instances of a series share the same RecurrenceGroupId
    public int? RecurrenceGroupId { get; set; }
}
