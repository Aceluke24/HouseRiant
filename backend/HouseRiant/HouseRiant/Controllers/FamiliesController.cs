using HouseRhiant.Api.Data;
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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Family>>> GetAll()
        => Ok(await _db.Families.Include(f => f.Residents).OrderBy(f => f.Name).ToListAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<Family>> GetById(int id)
    {
        var family = await _db.Families
            .Include(f => f.Residents)
            .Include(f => f.NotableFigures)
            .FirstOrDefaultAsync(f => f.Id == id);
        if (family is null) return NotFound();
        return Ok(family);
    }

    [HttpPost]
    public async Task<ActionResult<Family>> Create([FromBody] Family family)
    {
        _db.Families.Add(family);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = family.Id }, family);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Family>> Update(int id, [FromBody] Family update)
    {
        var family = await _db.Families.FindAsync(id);
        if (family is null) return NotFound();
        family.Name = update.Name;
        family.Allegiance = update.Allegiance;
        family.Notes = update.Notes;
        await _db.SaveChangesAsync();
        return Ok(family);
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
