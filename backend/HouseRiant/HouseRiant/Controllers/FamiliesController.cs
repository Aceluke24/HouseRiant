using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FamiliesController : ControllerBase
{
    private readonly AppDbContext _db;
    public FamiliesController(AppDbContext db) => _db = db;

    // Helper: converts a Family model + its loaded collections into a FamilyDto
    private static FamilyDto ToDto(Family f) => new()
    {
        Id = f.Id,
        Name = f.Name,
        Origin = f.Origin,
        Expertise = f.Expertise,
        Motto = f.Motto,
        HeadOfFamily = f.HeadOfFamily,
        Relationship = f.Relationship,
        Allegiance = f.Allegiance,
        Notes = f.Notes,
        ResidentCount = f.Residents.Count,
        NotableFigureCount = f.NotableFigures.Count,
    };

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FamilyDto>>> GetAll()
    {
        var families = await _db.Families
            .Include(f => f.Residents)
            .Include(f => f.NotableFigures)
            .OrderBy(f => f.Name)
            .ToListAsync();

        return Ok(families.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FamilyDto>> GetById(int id)
    {
        var family = await _db.Families
            .Include(f => f.Residents)
            .Include(f => f.NotableFigures)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (family is null) return NotFound();
        return Ok(ToDto(family));
    }

    [HttpPost]
    public async Task<ActionResult<FamilyDto>> Create([FromBody] CreateFamilyDto dto)
    {
        var family = new Family
        {
            Name = dto.Name,
            Origin = dto.Origin,
            Expertise = dto.Expertise,
            Motto = dto.Motto,
            HeadOfFamily = dto.HeadOfFamily,
            Relationship = dto.Relationship,
            Allegiance = dto.Allegiance,
            Notes = dto.Notes,
        };

        _db.Families.Add(family);
        await _db.SaveChangesAsync();

        // Re-fetch so counts are accurate (both will be 0 for a new family)
        return CreatedAtAction(nameof(GetById), new { id = family.Id }, ToDto(family));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<FamilyDto>> Update(int id, [FromBody] CreateFamilyDto dto)
    {
        var family = await _db.Families
            .Include(f => f.Residents)
            .Include(f => f.NotableFigures)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (family is null) return NotFound();

        family.Name = dto.Name;
        family.Origin = dto.Origin;
        family.Expertise = dto.Expertise;
        family.Motto = dto.Motto;
        family.HeadOfFamily = dto.HeadOfFamily;
        family.Relationship = dto.Relationship;
        family.Allegiance = dto.Allegiance;
        family.Notes = dto.Notes;

        await _db.SaveChangesAsync();
        return Ok(ToDto(family));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var family = await _db.Families.FindAsync(id);
        if (family is null) return NotFound();
        _db.Families.Remove(family);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
