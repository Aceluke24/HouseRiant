namespace HouseRhiant.Api.Models;

public class God
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string Tier { get; set; } = "Primal";
    public string? PrimaryDomain { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
}
