using HouseRhiant.Api.Models;

namespace HouseRhiant.Api.DTOs;

public record CreateCalendarEventRequest(
    string Name,
    string? Description,
    CalendarEventType Type,
    int Year,
    string Season,
    string? Week,
    int Day,
    string DisplayDate,
    int SortOrder,
    string? Notes,
    int? LinkedTaskId,
    string? ShortLabel,
    string? EndWeek,
    int? EndDay
);
