using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FinancesController : ControllerBase
{
    private readonly AppDbContext _db;
    public FinancesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<EstateFinances>> Get()
    {
        var finances = await _db.EstateFinances.FirstOrDefaultAsync();
        if (finances is null) return NotFound();
        return Ok(finances);
    }

    [HttpPut]
    public async Task<ActionResult<EstateFinances>> Update([FromBody] UpdateEstateFinancesRequest req)
    {
        var finances = await _db.EstateFinances.FirstOrDefaultAsync();
        if (finances is null) return NotFound();
        finances.BankBalanceTin = req.BankBalanceTin;
        finances.MoneyOnHandTin = req.MoneyOnHandTin;
        finances.DorrinFundsTin = req.DorrinFundsTin;
        finances.LoanAmountTin = req.LoanAmountTin;
        finances.TaxRateTin = req.TaxRateTin;
        finances.TaxNotes = req.TaxNotes;
        finances.CurrentGameDate = req.CurrentGameDate;
        finances.CurrentSeason = req.CurrentSeason;
        finances.LastUpdated = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(finances);
    }

    [HttpGet("income")]
    public async Task<ActionResult<IEnumerable<IncomeSource>>> GetIncomeSources()
        => Ok(await _db.IncomeSources.OrderBy(i => i.Name).ToListAsync());

    [HttpPost("income")]
    public async Task<ActionResult<IncomeSource>> CreateIncomeSource([FromBody] CreateIncomeSourceRequest req)
    {
        var source = new IncomeSource
        {
            Name = req.Name,
            DailyYieldTin = req.DailyYieldTin,
            IsActive = req.IsActive,
            Notes = req.Notes
        };
        _db.IncomeSources.Add(source);
        await _db.SaveChangesAsync();
        return Ok(source);
    }

    [HttpPut("income/{id}")]
    public async Task<ActionResult<IncomeSource>> UpdateIncomeSource(int id, [FromBody] CreateIncomeSourceRequest req)
    {
        var source = await _db.IncomeSources.FindAsync(id);
        if (source is null) return NotFound();
        source.Name = req.Name;
        source.DailyYieldTin = req.DailyYieldTin;
        source.IsActive = req.IsActive;
        source.Notes = req.Notes;
        await _db.SaveChangesAsync();
        return Ok(source);
    }

    [HttpDelete("income/{id}")]
    public async Task<IActionResult> DeleteIncomeSource(int id)
    {
        var source = await _db.IncomeSources.FindAsync(id);
        if (source is null) return NotFound();
        _db.IncomeSources.Remove(source);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
