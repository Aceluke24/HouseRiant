using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
 
namespace HouseRhiant.Api.Controllers;
 
[ApiController]
[Route("api/[controller]")]
public class NotableFiguresController : ControllerBase
{
    private readonly AppDbContext _db;
    public NotableFiguresController(AppDbContext db) => _db = db;
 
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotableFigureResponse>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? relationship)
    {
        var query = _db.NotableFigures.Include(n => n.Family).AsQueryable();
 
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(n =>
                n.Name.ToLower().Contains(term) ||
                (n.Role != null && n.Role.ToLower().Contains(term)) ||
                (n.Location != null && n.Location.ToLower().Contains(term)) ||
                (n.Faction != null && n.Faction.ToLower().Contains(term)) ||
                (n.Notes != null && n.Notes.ToLower().Contains(term))
            );
        }
 
        if (!string.IsNullOrWhiteSpace(relationship))
            query = query.Where(n => n.Relationship == relationship);
 
        var figures = await query.OrderBy(n => n.Name).ToListAsync();
        return Ok(figures.Select(ToResponse));
    }
 
    [HttpGet("{id}")]
    public async Task<ActionResult<NotableFigureResponse>> GetById(int id)
    {
        var n = await _db.NotableFigures.Include(n => n.Family).FirstOrDefaultAsync(n => n.Id == id);
        if (n is null) return NotFound();
        return Ok(ToResponse(n));
    }
 
    [HttpPost]
    public async Task<ActionResult<NotableFigureResponse>> Create([FromBody] CreateNotableFigureRequest req)
    {
        var figure = new NotableFigure
        {
            Name = req.Name, Title = req.Title, Role = req.Role, Type = req.Type,
            Race = req.Race, Gender = req.Gender, Age = req.Age, Location = req.Location,
            Faction = req.Faction, Relationship = req.Relationship, Appearance = req.Appearance,
            Skills = req.Skills, IsAlive = req.IsAlive, FirstMet = req.FirstMet,
            LastSeen = req.LastSeen, Notes = req.Notes, FamilyId = req.FamilyId
        };
        _db.NotableFigures.Add(figure);
        await _db.SaveChangesAsync();
        await _db.Entry(figure).Reference(n => n.Family).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = figure.Id }, ToResponse(figure));
    }
 
    [HttpPut("{id}")]
    public async Task<ActionResult<NotableFigureResponse>> Update(int id, [FromBody] CreateNotableFigureRequest req)
    {
        var figure = await _db.NotableFigures.Include(n => n.Family).FirstOrDefaultAsync(n => n.Id == id);
        if (figure is null) return NotFound();
        figure.Name = req.Name; figure.Title = req.Title; figure.Role = req.Role;
        figure.Type = req.Type; figure.Race = req.Race; figure.Gender = req.Gender;
        figure.Age = req.Age; figure.Location = req.Location; figure.Faction = req.Faction;
        figure.Relationship = req.Relationship; figure.Appearance = req.Appearance;
        figure.Skills = req.Skills; figure.IsAlive = req.IsAlive; figure.FirstMet = req.FirstMet;
        figure.LastSeen = req.LastSeen; figure.Notes = req.Notes; figure.FamilyId = req.FamilyId;
        await _db.SaveChangesAsync();
        await _db.Entry(figure).Reference(n => n.Family).LoadAsync();
        return Ok(ToResponse(figure));
    }
 
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var figure = await _db.NotableFigures.FindAsync(id);
        if (figure is null) return NotFound();
        _db.NotableFigures.Remove(figure);
        await _db.SaveChangesAsync();
        return NoContent();
    }
 
    private static NotableFigureResponse ToResponse(NotableFigure n) => new(
        n.Id, n.Name, n.Title, n.Role, n.Type, n.Race, n.Gender?.ToString(),
        n.Age, n.Location, n.Faction, n.Relationship, n.Appearance, n.Skills,
        n.IsAlive, n.FirstMet, n.LastSeen, n.Notes, n.ImageUrl, n.FamilyId, n.Family?.Name
    );
}
