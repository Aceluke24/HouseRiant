using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorldLocationsController : ControllerBase
{
    private readonly AppDbContext _db;
    public WorldLocationsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorldLocationDto>>> GetAll()
    {
        var locations = await _db.WorldLocations.OrderBy(w => w.Name).ToListAsync();
        return Ok(locations.Select(ToDto));
    }

    [HttpPost]
    public async Task<ActionResult<WorldLocationDto>> Create([FromBody] CreateWorldLocationDto req)
    {
        var location = new WorldLocation
        {
            Name = req.Name, Description = req.Description, Notes = req.Notes,
            IsUnlocked = req.IsUnlocked, XPercent = req.XPercent, YPercent = req.YPercent,
            LocationType = req.LocationType,
        };
        _db.WorldLocations.Add(location);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { }, ToDto(location));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<WorldLocationDto>> Update(int id, [FromBody] CreateWorldLocationDto req)
    {
        var location = await _db.WorldLocations.FindAsync(id);
        if (location is null) return NotFound();
        location.Name = req.Name; location.Description = req.Description;
        location.Notes = req.Notes; location.IsUnlocked = req.IsUnlocked;
        location.XPercent = req.XPercent; location.YPercent = req.YPercent;
        location.LocationType = req.LocationType;
        await _db.SaveChangesAsync();
        return Ok(ToDto(location));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var location = await _db.WorldLocations.FindAsync(id);
        if (location is null) return NotFound();
        _db.WorldLocations.Remove(location);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static WorldLocationDto ToDto(WorldLocation w) => new()
    {
        Id = w.Id, Name = w.Name, Description = w.Description, Notes = w.Notes,
        IsUnlocked = w.IsUnlocked, XPercent = w.XPercent, YPercent = w.YPercent,
        LocationType = w.LocationType,
    };
}
