namespace HouseRhiant.Api.Models;

public class Organization
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string Type { get; set; } = "Other";
    public string? Description { get; set; }
    public string? Headquarters { get; set; }
    public string? Leader { get; set; }
    public string Relationship { get; set; } = "Unknown";
    public string? Allegiance { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }
}
