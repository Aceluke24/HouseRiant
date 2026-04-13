namespace HouseRhiant.Api.Models;

public class Family
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Where this family originates from
    public string? Origin { get; set; }

    // What this family is known for / specialises in
    public string? Expertise { get; set; }

    // House motto
    public string? Motto { get; set; }

    // Name of the head of the family (free text for now)
    public string? HeadOfFamily { get; set; }

    // Relationship to House Riant
    // e.g. Ally, Friend, Neutral, Foe, Unknown, Vassal, Rival
    public string? Relationship { get; set; }

    // Legacy field — kept for existing data
    public string? Allegiance { get; set; }

    public string? Notes { get; set; }

    // Navigation properties
    public ICollection<Resident> Residents { get; set; } = new List<Resident>();
    public ICollection<NotableFigure> NotableFigures { get; set; } = new List<NotableFigure>();
    public ICollection<EstateTask> Tasks { get; set; } = new List<EstateTask>();
}
