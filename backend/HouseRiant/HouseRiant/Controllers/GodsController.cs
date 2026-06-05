using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GodsController : ControllerBase
{
    private readonly AppDbContext _db;
    public GodsController(AppDbContext db) => _db = db;

    private static GodDto ToDto(God g) => new(
        g.Id, g.Name, g.Tier, g.PrimaryDomain, g.Description, g.Notes, g.IsActive
    );

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GodDto>>> GetAll(string? search, string? tier)
    {
        var query = _db.Gods.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(g =>
                g.Name.ToLower().Contains(s) ||
                (g.PrimaryDomain != null && g.PrimaryDomain.ToLower().Contains(s)) ||
                (g.Description != null && g.Description.ToLower().Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(tier))
            query = query.Where(g => g.Tier == tier);

        var gods = await query
            .OrderBy(g => g.Tier)
            .ThenBy(g => g.Name)
            .ToListAsync();

        return Ok(gods.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GodDto>> GetById(int id)
    {
        var god = await _db.Gods.FindAsync(id);
        if (god is null) return NotFound();
        return Ok(ToDto(god));
    }

    [HttpPost]
    public async Task<ActionResult<GodDto>> Create([FromBody] CreateGodDto dto)
    {
        var god = new God
        {
            Name = dto.Name,
            Tier = dto.Tier,
            PrimaryDomain = dto.PrimaryDomain,
            Description = dto.Description,
            Notes = dto.Notes,
            IsActive = dto.IsActive,
        };

        _db.Gods.Add(god);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = god.Id }, ToDto(god));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<GodDto>> Update(int id, [FromBody] CreateGodDto dto)
    {
        var god = await _db.Gods.FindAsync(id);
        if (god is null) return NotFound();

        god.Name = dto.Name;
        god.Tier = dto.Tier;
        god.PrimaryDomain = dto.PrimaryDomain;
        god.Description = dto.Description;
        god.Notes = dto.Notes;
        god.IsActive = dto.IsActive;

        await _db.SaveChangesAsync();
        return Ok(ToDto(god));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var god = await _db.Gods.FindAsync(id);
        if (god is null) return NotFound();
        _db.Gods.Remove(god);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
