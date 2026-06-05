using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SkillsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SkillsController(AppDbContext db) => _db = db;

    private static SkillDto ToDto(Skill s) => new(
        s.Id, s.Name, s.Category, s.Trained, s.XpCost, s.CoreAttribute, s.Description, s.Notes
    );

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SkillDto>>> GetAll(string? search, string? category, string? trained)
    {
        var query = _db.Skills.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(sk =>
                sk.Name.ToLower().Contains(s) ||
                (sk.Description != null && sk.Description.ToLower().Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(sk => sk.Category == category);

        if (!string.IsNullOrWhiteSpace(trained) && bool.TryParse(trained, out var trainedBool))
            query = query.Where(sk => sk.Trained == trainedBool);

        var skills = await query
            .OrderBy(sk => sk.Category)
            .ThenBy(sk => sk.Name)
            .ToListAsync();

        return Ok(skills.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SkillDto>> GetById(int id)
    {
        var skill = await _db.Skills.FindAsync(id);
        if (skill is null) return NotFound();
        return Ok(ToDto(skill));
    }

    [HttpPost]
    public async Task<ActionResult<SkillDto>> Create([FromBody] CreateSkillDto dto)
    {
        var skill = new Skill
        {
            Name = dto.Name,
            Category = dto.Category,
            Trained = dto.Trained,
            XpCost = dto.XpCost,
            CoreAttribute = dto.CoreAttribute,
            Description = dto.Description,
            Notes = dto.Notes,
        };

        _db.Skills.Add(skill);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = skill.Id }, ToDto(skill));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SkillDto>> Update(int id, [FromBody] CreateSkillDto dto)
    {
        var skill = await _db.Skills.FindAsync(id);
        if (skill is null) return NotFound();

        skill.Name = dto.Name;
        skill.Category = dto.Category;
        skill.Trained = dto.Trained;
        skill.XpCost = dto.XpCost;
        skill.CoreAttribute = dto.CoreAttribute;
        skill.Description = dto.Description;
        skill.Notes = dto.Notes;

        await _db.SaveChangesAsync();
        return Ok(ToDto(skill));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var skill = await _db.Skills.FindAsync(id);
        if (skill is null) return NotFound();
        _db.Skills.Remove(skill);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
