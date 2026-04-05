namespace HouseRhiant.Api.Models;

public enum PersonStatus
{
    Resident,
    HiredHelp,
    Visitor,
    Seasonal,
    Blank,
    Din,
    Other
}

public enum Gender
{
    Male,
    Female
}

public class Resident
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public PersonStatus Status { get; set; }
    public string? StatusOther { get; set; }
    public string? Title { get; set; }
    public string? Role { get; set; }
    public string? Type { get; set; }
    public string? Race { get; set; }
    public string? KrellTribe { get; set; }
    public Gender? Gender { get; set; }
    public int? Age { get; set; }
    public decimal? DailyPayRate { get; set; }
    public string? LandOwned { get; set; }
    public string? Appearance { get; set; }
    public string? Skills { get; set; }
    public string? TroopType { get; set; }
    public string? LevelOfRole { get; set; }
    public string? Notes { get; set; }
    public string? ImageUrl { get; set; }

    public int? FamilyId { get; set; }
    public Family? Family { get; set; }
    public ICollection<EstateTask> Tasks { get; set; } = new List<EstateTask>();
}
