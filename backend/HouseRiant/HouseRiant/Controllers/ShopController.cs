using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShopController : ControllerBase
{
    private readonly AppDbContext _db;
    public ShopController(AppDbContext db) => _db = db;

    private static ShopItemDto ToDto(ShopItem s) => new(
        s.Id, s.Name, s.Category, s.BaseCostTin, s.WeightLbs,
        s.Description, s.Notes, s.DefaultMaterial
    );

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShopItemDto>>> GetAll(string? search, string? category)
    {
        var query = _db.ShopItems.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(i =>
                i.Name.ToLower().Contains(s) ||
                (i.Description != null && i.Description.ToLower().Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(i => i.Category == category);

        var items = await query
            .OrderBy(i => i.Category)
            .ThenBy(i => i.Name)
            .ToListAsync();

        return Ok(items.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ShopItemDto>> GetById(int id)
    {
        var item = await _db.ShopItems.FindAsync(id);
        if (item is null) return NotFound();
        return Ok(ToDto(item));
    }

    [HttpPost]
    public async Task<ActionResult<ShopItemDto>> Create([FromBody] CreateShopItemDto dto)
    {
        var item = new ShopItem
        {
            Name = dto.Name,
            Category = dto.Category,
            BaseCostTin = dto.BaseCostTin,
            WeightLbs = dto.WeightLbs,
            Description = dto.Description,
            Notes = dto.Notes,
            DefaultMaterial = dto.DefaultMaterial,
        };

        _db.ShopItems.Add(item);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ToDto(item));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ShopItemDto>> Update(int id, [FromBody] CreateShopItemDto dto)
    {
        var item = await _db.ShopItems.FindAsync(id);
        if (item is null) return NotFound();

        item.Name = dto.Name;
        item.Category = dto.Category;
        item.BaseCostTin = dto.BaseCostTin;
        item.WeightLbs = dto.WeightLbs;
        item.Description = dto.Description;
        item.Notes = dto.Notes;
        item.DefaultMaterial = dto.DefaultMaterial;

        await _db.SaveChangesAsync();
        return Ok(ToDto(item));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.ShopItems.FindAsync(id);
        if (item is null) return NotFound();
        _db.ShopItems.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
