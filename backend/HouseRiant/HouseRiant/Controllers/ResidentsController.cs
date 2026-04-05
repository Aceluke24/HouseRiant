using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResidentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ResidentsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ResidentResponse>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status)
    {
        var query = _db.Residents.Include(r => r.Family).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(r =>
                r.Name.ToLower().Contains(term) ||
                (r.Role != null && r.Role.ToLower().Contains(term)) ||
                (r.Skills != null && r.Skills.ToLower().Contains(term)) ||
                (r.Notes != null && r.Notes.ToLower().Contains(term)) ||
                (r.Race != null && r.Race.ToLower().Contains(term)) ||
                (r.Title != null && r.Title.ToLower().Contains(term))
            );
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<PersonStatus>(status, out var s))
            query = query.Where(r => r.Status == s);

        var residents = await query.OrderBy(r => r.Name).ToListAsync();
        return Ok(residents.Select(ToResponse));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResidentResponse>> GetById(int id)
    {
        var r = await _db.Residents.Include(r => r.Family).FirstOrDefaultAsync(r => r.Id == id);
        if (r is null) return NotFound();
        return Ok(ToResponse(r));
    }

    [HttpPost]
    public async Task<ActionResult<ResidentResponse>> Create([FromBody] CreateResidentRequest req)
    {
        var familyId = await NormalizeAndValidateFamilyId(req.FamilyId);
        if (familyId is int invalidId && invalidId < 0)
            return BadRequest(new { message = $"Family with id {Math.Abs(invalidId)} was not found." });

        var resident = new Resident
        {
            Name = req.Name, Status = req.Status, StatusOther = req.StatusOther,
            Title = req.Title, Role = req.Role, Type = req.Type, Race = req.Race,
            KrellTribe = req.KrellTribe,
            Gender = req.Gender, Age = req.Age, DailyPayRate = req.DailyPayRate,
            LandOwned = req.LandOwned, Appearance = req.Appearance, Skills = req.Skills,
            TroopType = req.TroopType, LevelOfRole = req.LevelOfRole,
            Notes = req.Notes, ImageUrl = req.ImageUrl, FamilyId = familyId
        };
        _db.Residents.Add(resident);
        await _db.SaveChangesAsync();
        await _db.Entry(resident).Reference(r => r.Family).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = resident.Id }, ToResponse(resident));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ResidentResponse>> Update(int id, [FromBody] CreateResidentRequest req)
    {
        var resident = await _db.Residents.Include(r => r.Family).FirstOrDefaultAsync(r => r.Id == id);
        if (resident is null) return NotFound();

        var familyId = await NormalizeAndValidateFamilyId(req.FamilyId);
        if (familyId is int invalidId && invalidId < 0)
            return BadRequest(new { message = $"Family with id {Math.Abs(invalidId)} was not found." });

        resident.Name = req.Name; resident.Status = req.Status; resident.StatusOther = req.StatusOther;
        resident.Title = req.Title; resident.Role = req.Role; resident.Type = req.Type;
        resident.Race = req.Race; resident.KrellTribe = req.KrellTribe;
        resident.Gender = req.Gender; resident.Age = req.Age;
        resident.DailyPayRate = req.DailyPayRate; resident.LandOwned = req.LandOwned;
        resident.Appearance = req.Appearance; resident.Skills = req.Skills;
        resident.TroopType = req.TroopType; resident.LevelOfRole = req.LevelOfRole;
        resident.Notes = req.Notes; resident.ImageUrl = req.ImageUrl; resident.FamilyId = familyId;
        await _db.SaveChangesAsync();
        await _db.Entry(resident).Reference(r => r.Family).LoadAsync();
        return Ok(ToResponse(resident));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var resident = await _db.Residents.FindAsync(id);
        if (resident is null) return NotFound();
        _db.Residents.Remove(resident);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ResidentResponse ToResponse(Resident r) => new(
        r.Id, r.Name, r.Status.ToString(), r.StatusOther, r.Title, r.Role,
        r.Type, r.Race, r.KrellTribe, r.Gender?.ToString(), r.Age, r.DailyPayRate,
        r.LandOwned, r.Appearance, r.Skills, r.TroopType, r.LevelOfRole,
        r.Notes, r.ImageUrl, r.FamilyId, r.Family?.Name
    );

    /// <summary>
    /// Returns null for empty/zero/negative values, positive id for existing families,
    /// and a negative sentinel when the requested family id does not exist.
    /// </summary>
    private async Task<int?> NormalizeAndValidateFamilyId(int? familyId)
    {
        if (!familyId.HasValue || familyId.Value <= 0) return null;
        var exists = await _db.Families.AnyAsync(f => f.Id == familyId.Value);
        return exists ? familyId.Value : -familyId.Value;
    }
}
