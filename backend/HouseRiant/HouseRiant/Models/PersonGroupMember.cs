namespace HouseRhiant.Api.Models;

public class PersonGroupMember
{
    public int Id { get; set; }

    public int GroupId { get; set; }
    public PersonGroup Group { get; set; } = null!;

    // Exactly one of these will be set per row
    public int? ResidentId { get; set; }
    public Resident? Resident { get; set; }

    public int? NotableFigureId { get; set; }
    public NotableFigure? NotableFigure { get; set; }
}
