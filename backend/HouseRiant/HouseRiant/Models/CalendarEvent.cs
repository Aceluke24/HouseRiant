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

    public int? LinkedTaskId { get; set; }
    public EstateTask? LinkedTask { get; set; }
}
