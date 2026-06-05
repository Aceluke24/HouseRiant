namespace HouseRhiant.Api.Models;

public class Skill
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string Category { get; set; } = "Knowledge";
    public bool Trained { get; set; } = false;
    public int XpCost { get; set; } = 0;
    public string? CoreAttribute { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
}
