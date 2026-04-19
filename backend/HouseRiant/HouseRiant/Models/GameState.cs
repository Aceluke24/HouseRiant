namespace HouseRhiant.Api.Models;

public class GameState
{
    public int Id { get; set; }
    public int CurrentYear { get; set; } = 58;
    public string? CurrentSeason { get; set; }
    public string? CurrentWeek { get; set; }   // null for Brón transition seasons
    public int CurrentDay { get; set; } = 1;
}
