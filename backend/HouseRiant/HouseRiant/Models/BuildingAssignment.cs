namespace HouseRhiant.Api.Models;

public class BuildingAssignment
{
    public int Id { get; set; }

    public int BuildingId { get; set; }
    public Building Building { get; set; } = null!;

    public int ResidentId { get; set; }
    public Resident Resident { get; set; } = null!;

    public string? AssignmentType { get; set; }  // e.g. "Workplace", "Stationed", "Training"
}
