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
            Notes = req.Notes, LinkedTaskId = req.LinkedTaskId
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
}
