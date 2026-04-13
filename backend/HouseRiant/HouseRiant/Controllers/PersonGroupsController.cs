using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonGroupsController : ControllerBase
{
    private readonly AppDbContext _db;
    public PersonGroupsController(AppDbContext db) => _db = db;

    // GET /api/persongroups
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PersonGroupResponse>>> GetAll()
    {
        var groups = await _db.PersonGroups
            .Include(g => g.Members)
            .OrderBy(g => g.Name)
            .ToListAsync();

        return Ok(groups.Select(g => new PersonGroupResponse(
            g.Id, g.Name, g.Description, g.Color, g.Members.Count)));
    }

    // GET /api/persongroups/{id}/members
    [HttpGet("{id}/members")]
    public async Task<ActionResult<IEnumerable<PersonGroupMemberResponse>>> GetMembers(int id)
    {
        var group = await _db.PersonGroups.FindAsync(id);
        if (group is null) return NotFound();

        var members = await _db.PersonGroupMembers
            .Where(m => m.GroupId == id)
            .Include(m => m.Resident)
            .Include(m => m.NotableFigure)
            .ToListAsync();

        return Ok(members.Select(m => new PersonGroupMemberResponse(
            m.Id, m.GroupId,
            m.ResidentId, m.Resident?.Name, m.Resident?.ImageUrl,
            m.NotableFigureId, m.NotableFigure?.Name, m.NotableFigure?.ImageUrl)));
    }

    // POST /api/persongroups
    [HttpPost]
    public async Task<ActionResult<PersonGroupResponse>> Create([FromBody] CreatePersonGroupRequest req)
    {
        var group = new PersonGroup
        {
            Name = req.Name,
            Description = req.Description,
            Color = req.Color,
        };
        _db.PersonGroups.Add(group);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = group.Id },
            new PersonGroupResponse(group.Id, group.Name, group.Description, group.Color, 0));
    }

    // PUT /api/persongroups/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult<PersonGroupResponse>> Update(int id, [FromBody] CreatePersonGroupRequest req)
    {
        var group = await _db.PersonGroups.Include(g => g.Members).FirstOrDefaultAsync(g => g.Id == id);
        if (group is null) return NotFound();
        group.Name = req.Name;
        group.Description = req.Description;
        group.Color = req.Color;
        await _db.SaveChangesAsync();
        return Ok(new PersonGroupResponse(group.Id, group.Name, group.Description, group.Color, group.Members.Count));
    }

    // DELETE /api/persongroups/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var group = await _db.PersonGroups.FindAsync(id);
        if (group is null) return NotFound();
        _db.PersonGroups.Remove(group);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // POST /api/persongroups/{id}/members
    [HttpPost("{id}/members")]
    public async Task<ActionResult<PersonGroupMemberResponse>> AddMember(int id, [FromBody] AddGroupMemberRequest req)
    {
        var group = await _db.PersonGroups.FindAsync(id);
        if (group is null) return NotFound();

        if (req.ResidentId == null && req.NotableFigureId == null)
            return BadRequest("Must specify either residentId or notableFigureId.");
        if (req.ResidentId != null && req.NotableFigureId != null)
            return BadRequest("Specify only one of residentId or notableFigureId.");

        // Prevent duplicate membership
        var existing = await _db.PersonGroupMembers.FirstOrDefaultAsync(m =>
            m.GroupId == id &&
            m.ResidentId == req.ResidentId &&
            m.NotableFigureId == req.NotableFigureId);
        if (existing != null) return Conflict("This person is already in the group.");

        var member = new PersonGroupMember
        {
            GroupId = id,
            ResidentId = req.ResidentId,
            NotableFigureId = req.NotableFigureId,
        };
        _db.PersonGroupMembers.Add(member);
        await _db.SaveChangesAsync();

        await _db.Entry(member).Reference(m => m.Resident).LoadAsync();
        await _db.Entry(member).Reference(m => m.NotableFigure).LoadAsync();

        return Ok(new PersonGroupMemberResponse(
            member.Id, member.GroupId,
            member.ResidentId, member.Resident?.Name, member.Resident?.ImageUrl,
            member.NotableFigureId, member.NotableFigure?.Name, member.NotableFigure?.ImageUrl));
    }

    // DELETE /api/persongroups/{groupId}/members/{memberId}
    [HttpDelete("{groupId}/members/{memberId}")]
    public async Task<IActionResult> RemoveMember(int groupId, int memberId)
    {
        var member = await _db.PersonGroupMembers
            .FirstOrDefaultAsync(m => m.Id == memberId && m.GroupId == groupId);
        if (member is null) return NotFound();
        _db.PersonGroupMembers.Remove(member);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
