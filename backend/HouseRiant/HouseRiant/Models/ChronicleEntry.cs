namespace HouseRhiant.Api.Models;

public class ChronicleEntry
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? EntryDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ChronicleEntryTag> EntryTags { get; set; } = new List<ChronicleEntryTag>();
    public ICollection<ChronicleEntryResident> EntryResidents { get; set; } = new List<ChronicleEntryResident>();
    public ICollection<ChronicleEntryNotableFigure> EntryNotableFigures { get; set; } = new List<ChronicleEntryNotableFigure>();
}
