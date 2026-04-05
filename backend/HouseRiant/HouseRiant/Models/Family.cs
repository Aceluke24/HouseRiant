namespace HouseRhiant.Api.Models;

public class Family
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Allegiance { get; set; }
    public string? Notes { get; set; }

    public ICollection<Resident> Residents { get; set; } = new List<Resident>();
    public ICollection<NotableFigure> NotableFigures { get; set; } = new List<NotableFigure>();
    public ICollection<EstateTask> Tasks { get; set; } = new List<EstateTask>();
}
