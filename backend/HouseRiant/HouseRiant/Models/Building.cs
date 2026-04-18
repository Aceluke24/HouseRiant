namespace HouseRhiant.Api.Models;

public enum BuildingCondition
{
    Ruined,
    Poor,
    Functional,
    Good,
    Excellent
}

public enum BuildingType
{
    Living,
    Storage,
    Defense,
    Agricultural,
    Workshop,
    Religious,
    Other
}

public class Building
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public BuildingType Type { get; set; }
    public string? Description { get; set; }
    public BuildingCondition Condition { get; set; }
    public int? CapacityPersons { get; set; }
    public int? StorageCapacityLbs { get; set; }
    public bool IsLivable { get; set; }
    public string? ImageUrl { get; set; }
    public string? ImagePosition { get; set; }  // CSS object-position, e.g. "center", "top left"
    public string? Notes { get; set; }

    public ICollection<EstateTask> Tasks { get; set; } = new List<EstateTask>();
    public ICollection<Resident> Residents { get; set; } = new List<Resident>();
    public ICollection<BuildingAssignment> Assignments { get; set; } = new List<BuildingAssignment>();
}
