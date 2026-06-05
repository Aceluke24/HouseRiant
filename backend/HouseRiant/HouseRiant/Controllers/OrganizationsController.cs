using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrganizationsController : ControllerBase
{
    private readonly AppDbContext _db;
    public OrganizationsController(AppDbContext db) => _db = db;

    private static OrganizationDto ToDto(Organization o) => new(
        o.Id, o.Name, o.Type, o.Description, o.Headquarters, o.Leader,
        o.Relationship, o.Allegiance, o.IsActive, o.Notes
    );

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrganizationDto>>> GetAll(
        string? search, string? type, string? relationship)
    {
        var query = _db.Organizations.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(o =>
                o.Name.ToLower().Contains(s) ||
                (o.Description != null && o.Description.ToLower().Contains(s)) ||
                (o.Headquarters != null && o.Headquarters.ToLower().Contains(s)) ||
                (o.Leader != null && o.Leader.ToLower().Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(o => o.Type == type);

        if (!string.IsNullOrWhiteSpace(relationship))
            query = query.Where(o => o.Relationship == relationship);

        var orgs = await query.OrderBy(o => o.Name).ToListAsync();
        return Ok(orgs.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrganizationDto>> GetById(int id)
    {
        var org = await _db.Organizations.FindAsync(id);
        if (org is null) return NotFound();
        return Ok(ToDto(org));
    }

    [HttpPost]
    public async Task<ActionResult<OrganizationDto>> Create([FromBody] CreateOrganizationDto dto)
    {
        var org = new Organization
        {
            Name = dto.Name,
            Type = dto.Type,
            Description = dto.Description,
            Headquarters = dto.Headquarters,
            Leader = dto.Leader,
            Relationship = dto.Relationship,
            Allegiance = dto.Allegiance,
            IsActive = dto.IsActive,
            Notes = dto.Notes,
        };

        _db.Organizations.Add(org);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = org.Id }, ToDto(org));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<OrganizationDto>> Update(int id, [FromBody] CreateOrganizationDto dto)
    {
        var org = await _db.Organizations.FindAsync(id);
        if (org is null) return NotFound();

        org.Name = dto.Name;
        org.Type = dto.Type;
        org.Description = dto.Description;
        org.Headquarters = dto.Headquarters;
        org.Leader = dto.Leader;
        org.Relationship = dto.Relationship;
        org.Allegiance = dto.Allegiance;
        org.IsActive = dto.IsActive;
        org.Notes = dto.Notes;

        await _db.SaveChangesAsync();
        return Ok(ToDto(org));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var org = await _db.Organizations.FindAsync(id);
        if (org is null) return NotFound();
        _db.Organizations.Remove(org);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
