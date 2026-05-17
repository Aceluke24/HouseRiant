namespace HouseRhiant.Api.Models;

public class WorldLocation
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public bool IsUnlocked { get; set; } = false;
    public float XPercent { get; set; }
    public float YPercent { get; set; }
    public string? LocationType { get; set; }
}
