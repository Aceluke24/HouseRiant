namespace HouseRhiant.Api.Models;

public class NotableFigure
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Role { get; set; }
    public string? Type { get; set; }
    public string? Race { get; set; }
    public string? KrellTribe { get; set; }
    public Gender? Gender { get; set; }
    public int? Age { get; set; }
    public string? Location { get; set; }
    public string? Faction { get; set; }
    public string? Relationship { get; set; }
    public string? Appearance { get; set; }
    public string? Skills { get; set; }
    public bool IsAlive { get; set; } = true;
    public string? FirstMet { get; set; }
    public string? LastSeen { get; set; }
    public string? Notes { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; } = 0;

    public int? FamilyId { get; set; }
    public Family? Family { get; set; }
    public ICollection<PersonGroupMember> GroupMemberships { get; set; } = new List<PersonGroupMember>();
}
