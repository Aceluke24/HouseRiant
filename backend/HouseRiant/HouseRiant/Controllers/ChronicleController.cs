using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChronicleController : ControllerBase
{
    private readonly AppDbContext _db;
    public ChronicleController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ChronicleEntryResponse>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? tag)
    {
        var query = _db.ChronicleEntries
            .Include(c => c.EntryTags).ThenInclude(et => et.Tag)
            .Include(c => c.EntryResidents).ThenInclude(er => er.Resident)
            .Include(c => c.EntryNotableFigures).ThenInclude(ef => ef.NotableFigure)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(c =>
                c.Title.ToLower().Contains(term) ||
                c.Body.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(tag))
        {
            var tagLower = tag.ToLower();
            query = query.Where(c =>
                c.EntryTags.Any(et => et.Tag.Name.ToLower() == tagLower));
        }

        var entries = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
        return Ok(entries.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ChronicleEntryResponse>> GetById(int id)
    {
        var entry = await LoadEntry(id);
        if (entry is null) return NotFound();
        return Ok(ToDto(entry));
    }

    [HttpPost]
    public async Task<ActionResult<ChronicleEntryResponse>> Create([FromBody] CreateChronicleEntryRequest req)
    {
        var entry = new ChronicleEntry
        {
            Title     = req.Title,
            Body      = req.Body,
            EntryDate = req.EntryDate,
            CreatedAt = DateTime.UtcNow,
        };
        _db.ChronicleEntries.Add(entry);
        await _db.SaveChangesAsync();

        await SyncJoins(entry.Id, req);
        await _db.SaveChangesAsync();

        var loaded = await LoadEntry(entry.Id);
        return CreatedAtAction(nameof(GetById), new { id = entry.Id }, ToDto(loaded!));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ChronicleEntryResponse>> Update(int id, [FromBody] CreateChronicleEntryRequest req)
    {
        var entry = await LoadEntry(id);
        if (entry is null) return NotFound();

        entry.Title     = req.Title;
        entry.Body      = req.Body;
        entry.EntryDate = req.EntryDate;

        // Replace all joins
        _db.ChronicleEntryTags.RemoveRange(entry.EntryTags);
        _db.ChronicleEntryResidents.RemoveRange(entry.EntryResidents);
        _db.ChronicleEntryNotableFigures.RemoveRange(entry.EntryNotableFigures);
        await _db.SaveChangesAsync();

        await SyncJoins(entry.Id, req);
        await _db.SaveChangesAsync();

        var loaded = await LoadEntry(entry.Id);
        return Ok(ToDto(loaded!));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entry = await _db.ChronicleEntries.FindAsync(id);
        if (entry is null) return NotFound();
        _db.ChronicleEntries.Remove(entry);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── Helpers ───────────────────────────────────────────

    private async Task<ChronicleEntry?> LoadEntry(int id) =>
        await _db.ChronicleEntries
            .Include(c => c.EntryTags).ThenInclude(et => et.Tag)
            .Include(c => c.EntryResidents).ThenInclude(er => er.Resident)
            .Include(c => c.EntryNotableFigures).ThenInclude(ef => ef.NotableFigure)
            .FirstOrDefaultAsync(c => c.Id == id);

    private async System.Threading.Tasks.Task SyncJoins(int entryId, CreateChronicleEntryRequest req)
    {
        if (req.TagIds != null)
        {
            foreach (var tagId in req.TagIds)
            {
                if (await _db.Tags.AnyAsync(t => t.Id == tagId))
                    _db.ChronicleEntryTags.Add(new ChronicleEntryTag { ChronicleEntryId = entryId, TagId = tagId });
            }
        }
        if (req.ResidentIds != null)
        {
            foreach (var rid in req.ResidentIds)
            {
                if (await _db.Residents.AnyAsync(r => r.Id == rid))
                    _db.ChronicleEntryResidents.Add(new ChronicleEntryResident { ChronicleEntryId = entryId, ResidentId = rid });
            }
        }
        if (req.NotableFigureIds != null)
        {
            foreach (var nid in req.NotableFigureIds)
            {
                if (await _db.NotableFigures.AnyAsync(n => n.Id == nid))
                    _db.ChronicleEntryNotableFigures.Add(new ChronicleEntryNotableFigure { ChronicleEntryId = entryId, NotableFigureId = nid });
            }
        }
    }

    private static ChronicleEntryResponse ToDto(ChronicleEntry c) => new(
        c.Id,
        c.Title,
        c.Body,
        c.EntryDate,
        c.CreatedAt,
        c.EntryTags.Select(et => new TagSummary(et.Tag.Id, et.Tag.Name, et.Tag.Color)),
        c.EntryResidents.Select(er => new LinkedPersonSummary(er.Resident.Id, er.Resident.Name)),
        c.EntryNotableFigures.Select(ef => new LinkedPersonSummary(ef.NotableFigure.Id, ef.NotableFigure.Name))
    );
}
