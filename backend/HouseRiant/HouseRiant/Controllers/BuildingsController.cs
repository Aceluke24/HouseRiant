using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
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
    public async Task<ActionResult<IEnumerable<BuildingDto>>> GetAll()
    {
        var buildings = await _db.Buildings
            .Include(b => b.Tasks)
            .Include(b => b.Residents)
            .Include(b => b.Assignments).ThenInclude(a => a.Resident)
            .OrderBy(b => b.Name)
            .ToListAsync();
        return Ok(buildings.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BuildingDto>> GetById(int id)
    {
        var b = await _db.Buildings
            .Include(b => b.Tasks)
            .Include(b => b.Residents)
            .Include(b => b.Assignments).ThenInclude(a => a.Resident)
            .FirstOrDefaultAsync(b => b.Id == id);
        if (b is null) return NotFound();
        return Ok(ToDto(b));
    }

    [HttpPost]
    public async Task<ActionResult<BuildingDto>> Create([FromBody] CreateBuildingDto dto)
    {
        if (!Enum.TryParse<BuildingType>(dto.Type, out var type)) return BadRequest("Invalid type");
        if (!Enum.TryParse<BuildingCondition>(dto.Condition, out var condition)) return BadRequest("Invalid condition");

        var building = new Building
        {
            Name = dto.Name,
            Type = type,
            Description = dto.Description,
            Condition = condition,
            CapacityPersons = dto.CapacityPersons,
            StorageCapacityLbs = dto.StorageCapacityLbs,
            IsLivable = dto.IsLivable,
            ImageUrl = dto.ImageUrl,
            ImagePosition = dto.ImagePosition,
            Notes = dto.Notes,
        };
        _db.Buildings.Add(building);
        await _db.SaveChangesAsync();
        await _db.Entry(building).Collection(b => b.Tasks).LoadAsync();
        await _db.Entry(building).Collection(b => b.Residents).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = building.Id }, ToDto(building));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BuildingDto>> Update(int id, [FromBody] CreateBuildingDto dto)
    {
        var building = await _db.Buildings
            .Include(b => b.Tasks)
            .Include(b => b.Residents)
            .Include(b => b.Assignments).ThenInclude(a => a.Resident)
            .FirstOrDefaultAsync(b => b.Id == id);
        if (building is null) return NotFound();

        if (!Enum.TryParse<BuildingType>(dto.Type, out var type)) return BadRequest("Invalid type");
        if (!Enum.TryParse<BuildingCondition>(dto.Condition, out var condition)) return BadRequest("Invalid condition");

        building.Name = dto.Name;
        building.Type = type;
        building.Description = dto.Description;
        building.Condition = condition;
        building.CapacityPersons = dto.CapacityPersons;
        building.StorageCapacityLbs = dto.StorageCapacityLbs;
        building.IsLivable = dto.IsLivable;
        building.ImageUrl = dto.ImageUrl;
        building.ImagePosition = dto.ImagePosition;
        building.Notes = dto.Notes;

        await _db.SaveChangesAsync();
        return Ok(ToDto(building));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var building = await _db.Buildings.FindAsync(id);
        if (building is null) return NotFound();
        _db.Buildings.Remove(building);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── Secondary assignments (many-to-many) ─────────────────

    [HttpPost("{id}/assignments")]
    public async Task<IActionResult> AddAssignment(int id, [FromBody] CreateBuildingAssignmentDto dto)
    {
        if (!await _db.Buildings.AnyAsync(b => b.Id == id)) return NotFound("Building not found");
        if (!await _db.Residents.AnyAsync(r => r.Id == dto.ResidentId)) return NotFound("Resident not found");

        var assignment = new BuildingAssignment
        {
            BuildingId = id,
            ResidentId = dto.ResidentId,
            AssignmentType = dto.AssignmentType,
        };
        _db.BuildingAssignments.Add(assignment);
        await _db.SaveChangesAsync();
        await _db.Entry(assignment).Reference(a => a.Resident).LoadAsync();

        return Ok(new BuildingAssignmentDto
        {
            Id = assignment.Id,
            ResidentId = assignment.ResidentId,
            ResidentName = assignment.Resident?.Name ?? string.Empty,
            ResidentImageUrl = assignment.Resident?.ImageUrl,
            AssignmentType = assignment.AssignmentType,
        });
    }

    [HttpDelete("{id}/assignments/{assignmentId}")]
    public async Task<IActionResult> RemoveAssignment(int id, int assignmentId)
    {
        var assignment = await _db.BuildingAssignments.FindAsync(assignmentId);
        if (assignment is null || assignment.BuildingId != id) return NotFound();
        _db.BuildingAssignments.Remove(assignment);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── Primary resident assignment ───────────────────────────

    [HttpPost("{id}/residents/{residentId}")]
    public async Task<IActionResult> AssignResident(int id, int residentId)
    {
        var building = await _db.Buildings.FindAsync(id);
        if (building is null) return NotFound("Building not found");

        var resident = await _db.Residents.FindAsync(residentId);
        if (resident is null) return NotFound("Resident not found");

        resident.BuildingId = id;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}/residents/{residentId}")]
    public async Task<IActionResult> UnassignResident(int id, int residentId)
    {
        var resident = await _db.Residents.FindAsync(residentId);
        if (resident is null) return NotFound("Resident not found");

        if (resident.BuildingId != id) return BadRequest("Resident is not assigned to this building");

        resident.BuildingId = null;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── Helpers ───────────────────────────────────────────────

    private static BuildingDto ToDto(Building b) => new()
    {
        Id = b.Id,
        Name = b.Name,
        Type = b.Type.ToString(),
        Description = b.Description,
        Condition = b.Condition.ToString(),
        CapacityPersons = b.CapacityPersons,
        StorageCapacityLbs = b.StorageCapacityLbs,
        IsLivable = b.IsLivable,
        ImageUrl = b.ImageUrl,
        ImagePosition = b.ImagePosition,
        Notes = b.Notes,
        Tasks = b.Tasks?.Select(t => new BuildingTaskSummaryDto
        {
            Id = t.Id,
            Name = t.Name,
            Status = t.Status.ToString(),
        }).ToList() ?? new(),
        Residents = b.Residents?.Select(r => new BuildingResidentSummaryDto
        {
            Id = r.Id,
            Name = r.Name,
            ImageUrl = r.ImageUrl,
        }).OrderBy(r => r.Name).ToList() ?? new(),
        Assignments = b.Assignments?.Select(a => new BuildingAssignmentDto
        {
            Id = a.Id,
            ResidentId = a.ResidentId,
            ResidentName = a.Resident?.Name ?? string.Empty,
            ResidentImageUrl = a.Resident?.ImageUrl,
            AssignmentType = a.AssignmentType,
        }).OrderBy(a => a.ResidentName).ToList() ?? new(),
    };
}
