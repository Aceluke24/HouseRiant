using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;
    public TasksController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskResponse>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? category,
        [FromQuery] string? search)
    {
        var query = _db.Tasks
            .Include(t => t.Building)
            .Include(t => t.AssignedFamily)
            .Include(t => t.AssignedResident)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(t =>
                t.Name.ToLower().Contains(term) ||
                (t.Description != null && t.Description.ToLower().Contains(term)) ||
                (t.Notes != null && t.Notes.ToLower().Contains(term))
            );
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<EstateTaskStatus>(status, out var s))
            query = query.Where(t => t.Status == s);

        if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<TaskCategory>(category, out var c))
            query = query.Where(t => t.Category == c);

        var tasks = await query.OrderBy(t => t.Priority).ThenBy(t => t.Name).ToListAsync();
        return Ok(tasks.Select(ToResponse));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskResponse>> GetById(int id)
    {
        var t = await _db.Tasks
            .Include(t => t.Building)
            .Include(t => t.AssignedFamily)
            .Include(t => t.AssignedResident)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (t is null) return NotFound();
        return Ok(ToResponse(t));
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponse>> Create([FromBody] CreateTaskRequest req)
    {
        var task = new EstateTask
        {
            Name = req.Name, Description = req.Description, Status = req.Status,
            Priority = req.Priority, Category = req.Category, CostTin = req.CostTin,
            PaymentMethod = req.PaymentMethod, PaymentNotes = req.PaymentNotes,
            TargetDate = req.TargetDate, CompletedDate = req.CompletedDate,
            Requirements = req.Requirements, Outcome = req.Outcome, Notes = req.Notes,
            BuildingId = req.BuildingId, AssignedFamilyId = req.AssignedFamilyId,
            AssignedResidentId = req.AssignedResidentId
        };
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();
        await LoadRelated(task);
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, ToResponse(task));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaskResponse>> Update(int id, [FromBody] CreateTaskRequest req)
    {
        var task = await _db.Tasks
            .Include(t => t.Building)
            .Include(t => t.AssignedFamily)
            .Include(t => t.AssignedResident)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (task is null) return NotFound();
        task.Name = req.Name; task.Description = req.Description; task.Status = req.Status;
        task.Priority = req.Priority; task.Category = req.Category; task.CostTin = req.CostTin;
        task.PaymentMethod = req.PaymentMethod; task.PaymentNotes = req.PaymentNotes;
        task.TargetDate = req.TargetDate; task.CompletedDate = req.CompletedDate;
        task.Requirements = req.Requirements; task.Outcome = req.Outcome; task.Notes = req.Notes;
        task.BuildingId = req.BuildingId; task.AssignedFamilyId = req.AssignedFamilyId;
        task.AssignedResidentId = req.AssignedResidentId;
        await _db.SaveChangesAsync();
        return Ok(ToResponse(task));
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] EstateTaskStatus status)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task is null) return NotFound();
        task.Status = status;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task is null) return NotFound();
        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async System.Threading.Tasks.Task LoadRelated(EstateTask task)
    {
        await _db.Entry(task).Reference(t => t.Building).LoadAsync();
        await _db.Entry(task).Reference(t => t.AssignedFamily).LoadAsync();
        await _db.Entry(task).Reference(t => t.AssignedResident).LoadAsync();
    }

    private static TaskResponse ToResponse(EstateTask t) => new(
        t.Id, t.Name, t.Description, t.Status.ToString(), t.Priority.ToString(),
        t.Category.ToString(), t.CostTin, t.PaymentMethod, t.PaymentNotes,
        t.TargetDate, t.CompletedDate, t.Requirements, t.Outcome, t.Notes,
        t.BuildingId, t.Building?.Name,
        t.AssignedFamilyId, t.AssignedFamily?.Name,
        t.AssignedResidentId, t.AssignedResident?.Name
    );
}
