using HouseRhiant.Api.Data;
using HouseRhiant.Api.DTOs;
using HouseRhiant.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HouseRhiant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameStateController : ControllerBase
{
    private readonly AppDbContext _db;
    public GameStateController(AppDbContext db) => _db = db;

    private static GameStateDto ToDto(GameState gs) => new(
        gs.Id,
        gs.CurrentYear,
        gs.CurrentSeason,
        gs.CurrentWeek,
        gs.CurrentDay
    );

    [HttpGet]
    public async Task<ActionResult<GameStateDto>> Get()
    {
        var gs = await _db.GameStates.FirstOrDefaultAsync();
        if (gs is null)
        {
            gs = new GameState
            {
                CurrentYear   = 58,
                CurrentSeason = "Brón: Bás",
                CurrentWeek   = null,
                CurrentDay    = 3,
            };
            _db.GameStates.Add(gs);
            await _db.SaveChangesAsync();
        }
        return Ok(ToDto(gs));
    }

    [HttpPatch]
    public async Task<ActionResult<GameStateDto>> Update([FromBody] UpdateGameDateRequest req)
    {
        var gs = await _db.GameStates.FirstOrDefaultAsync();
        if (gs is null) return NotFound();
        gs.CurrentYear   = req.CurrentYear;
        gs.CurrentSeason = req.CurrentSeason;
        gs.CurrentWeek   = req.CurrentWeek;
        gs.CurrentDay    = req.CurrentDay;
        await _db.SaveChangesAsync();
        return Ok(ToDto(gs));
    }
}
