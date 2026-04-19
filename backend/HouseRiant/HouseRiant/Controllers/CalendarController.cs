using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalendarController : ControllerBase
{
    private readonly AppDbContext _db;
    public CalendarController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CalendarEvent>>> GetAll(
        [FromQuery] int? year,
        [FromQuery] string? season)
    {
        var query = _db.CalendarEvents.Include(c => c.LinkedTask).AsQueryable();

        if (year.HasValue)
            query = query.Where(c => c.Year == year.Value);

        if (!string.IsNullOrWhiteSpace(season))
            query = query.Where(c => c.Season == season);

        return Ok(await query.OrderBy(c => c.SortOrder).ToListAsync());
    }

    [HttpPost]
    public async Task<ActionResult<CalendarEvent>> Create([FromBody] CreateCalendarEventRequest req)
    {
        var ev = new CalendarEvent
        {
            Name = req.Name, Description = req.Description, Type = req.Type,
            Year = req.Year, Season = req.Season, Week = req.Week, Day = req.Day,
            DisplayDate = req.DisplayDate, SortOrder = req.SortOrder,
            Notes = req.Notes, LinkedTaskId = req.LinkedTaskId,
            ShortLabel = req.ShortLabel, EndWeek = req.EndWeek, EndDay = req.EndDay
        };
        _db.CalendarEvents.Add(ev);
        await _db.SaveChangesAsync();
        return Ok(ev);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CalendarEvent>> Update(int id, [FromBody] CreateCalendarEventRequest req)
    {
        var ev = await _db.CalendarEvents.FindAsync(id);
        if (ev is null) return NotFound();
        ev.Name = req.Name; ev.Description = req.Description; ev.Type = req.Type;
        ev.Year = req.Year; ev.Season = req.Season; ev.Week = req.Week; ev.Day = req.Day;
        ev.DisplayDate = req.DisplayDate; ev.SortOrder = req.SortOrder;
        ev.Notes = req.Notes; ev.LinkedTaskId = req.LinkedTaskId;
        ev.ShortLabel = req.ShortLabel; ev.EndWeek = req.EndWeek; ev.EndDay = req.EndDay;
        await _db.SaveChangesAsync();
        return Ok(ev);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ev = await _db.CalendarEvents.FindAsync(id);
        if (ev is null) return NotFound();
        _db.CalendarEvents.Remove(ev);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("batch")]
    public async Task<ActionResult<IEnumerable<CalendarEvent>>> BatchCreate(
        [FromBody] BatchCreateCalendarEventsRequest req)
    {
        if (req.Events == null || req.Events.Count == 0)
            return BadRequest("No events provided.");

        int? maxGroup = await _db.CalendarEvents
            .Where(c => c.RecurrenceGroupId != null)
            .MaxAsync(c => (int?)c.RecurrenceGroupId);
        int groupId = (maxGroup ?? 0) + 1;

        var created = new List<CalendarEvent>();
        foreach (var r in req.Events)
        {
            var ev = new CalendarEvent
            {
                Name = r.Name, Description = r.Description, Type = r.Type,
                Year = r.Year, Season = r.Season, Week = r.Week, Day = r.Day,
                DisplayDate = r.DisplayDate, SortOrder = r.SortOrder,
                Notes = r.Notes, LinkedTaskId = r.LinkedTaskId,
                ShortLabel = r.ShortLabel, EndWeek = r.EndWeek, EndDay = r.EndDay,
                RecurrenceGroupId = groupId
            };
            _db.CalendarEvents.Add(ev);
            created.Add(ev);
        }
        await _db.SaveChangesAsync();
        return Ok(created);
    }

    [HttpDelete("group/{groupId:int}")]
    public async Task<IActionResult> DeleteGroup(int groupId)
    {
        var events = await _db.CalendarEvents
            .Where(c => c.RecurrenceGroupId == groupId)
            .ToListAsync();
        if (events.Count == 0) return NotFound();
        _db.CalendarEvents.RemoveRange(events);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
