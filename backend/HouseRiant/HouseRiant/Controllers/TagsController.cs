using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly AppDbContext _db;
    public TagsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TagResponse>>> GetAll()
    {
        var tags = await _db.Tags.OrderBy(t => t.Name).ToListAsync();
        return Ok(tags.Select(ToDto));
    }

    [HttpPost]
    public async Task<ActionResult<TagResponse>> Create([FromBody] CreateTagRequest req)
    {
        if (await _db.Tags.AnyAsync(t => t.Name.ToLower() == req.Name.ToLower()))
            return Conflict(new { message = $"A tag named '{req.Name}' already exists." });

        var tag = new Tag { Name = req.Name, Color = req.Color };
        _db.Tags.Add(tag);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = tag.Id }, ToDto(tag));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tag = await _db.Tags.FindAsync(id);
        if (tag is null) return NotFound();
        _db.Tags.Remove(tag);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static TagResponse ToDto(Tag t) => new(t.Id, t.Name, t.Color);
}
