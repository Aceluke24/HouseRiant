namespace HouseRhiant.Api.Models;

public enum InventoryCategory
{
    Animals,
    Weapons,
    Tools,
    Materials,
    Food,
    Documents,
    Clothing,
    Other,
    Armor,
    Medicine,
    MagicItems,
    Valuables,
    Equipment
}

public enum InventoryCondition
{
    Poor,
    Fair,
    Good,
    Excellent
}

public class Inventory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public string? Unit { get; set; }             // "horses", "barrels", "lbs", "feet"
    public InventoryCategory Category { get; set; }
    public InventoryCondition? Condition { get; set; }
    public string? Description { get; set; }
    public decimal? EstimatedValue { get; set; }
    public string? Location { get; set; }         // "Storehouse", "Armory", etc.
    public string? Notes { get; set; }
}
