using HouseRhiant.Api.Data;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BuildingsController : ControllerBase
{
    private readonly AppDbContext _db;
    public BuildingsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Building>>> GetAll()
        => Ok(await _db.Buildings.Include(b => b.Tasks).OrderBy(b => b.Name).ToListAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<Building>> GetById(int id)
    {
        var b = await _db.Buildings.Include(b => b.Tasks).FirstOrDefaultAsync(b => b.Id == id);
        if (b is null) return NotFound();
        return Ok(b);
    }

    [HttpPost]
    public async Task<ActionResult<Building>> Create([FromBody] Building building)
    {
        _db.Buildings.Add(building);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = building.Id }, building);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Building>> Update(int id, [FromBody] Building update)
    {
        var building = await _db.Buildings.FindAsync(id);
        if (building is null) return NotFound();
        building.Name = update.Name; building.Type = update.Type;
        building.Description = update.Description; building.Condition = update.Condition;
        building.CapacityPersons = update.CapacityPersons;
        building.StorageCapacityLbs = update.StorageCapacityLbs;
        building.IsLivable = update.IsLivable; building.Notes = update.Notes;
        await _db.SaveChangesAsync();
        return Ok(building);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var building = await _db.Buildings.FindAsync(id);
        if (building is null) return NotFound();
        _db.Buildings.Remove(building);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
