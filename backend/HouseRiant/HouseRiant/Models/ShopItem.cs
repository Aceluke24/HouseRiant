namespace HouseRhiant.Api.Models;

public class ShopItem
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string Category { get; set; } = "Other";
    public decimal BaseCostTin { get; set; } = 0;
    public decimal? WeightLbs { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public string? DefaultMaterial { get; set; }
}
