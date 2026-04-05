using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly AppDbContext _db;
    public InventoryController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Inventory>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? category)
    {
        var query = _db.Inventories.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(i => i.Name.ToLower().Contains(term) ||
                (i.Description != null && i.Description.ToLower().Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<InventoryCategory>(category, out var c))
            query = query.Where(i => i.Category == c);

        return Ok(await query.OrderBy(i => i.Category).ThenBy(i => i.Name).ToListAsync());
    }

    [HttpPost]
    public async Task<ActionResult<Inventory>> Create([FromBody] CreateInventoryRequest req)
    {
        var item = new Inventory
        {
            Name = req.Name, Quantity = req.Quantity, Unit = req.Unit,
            Category = req.Category, Condition = req.Condition,
            Description = req.Description, EstimatedValue = req.EstimatedValue,
            Location = req.Location, Notes = req.Notes
        };
        _db.Inventories.Add(item);
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Inventory>> Update(int id, [FromBody] CreateInventoryRequest req)
    {
        var item = await _db.Inventories.FindAsync(id);
        if (item is null) return NotFound();
        item.Name = req.Name; item.Quantity = req.Quantity; item.Unit = req.Unit;
        item.Category = req.Category; item.Condition = req.Condition;
        item.Description = req.Description; item.EstimatedValue = req.EstimatedValue;
        item.Location = req.Location; item.Notes = req.Notes;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.Inventories.FindAsync(id);
        if (item is null) return NotFound();
        _db.Inventories.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
