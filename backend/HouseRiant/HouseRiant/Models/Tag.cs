namespace HouseRhiant.Api.Models;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Color { get; set; }

    public ICollection<ChronicleEntryTag> EntryTags { get; set; } = new List<ChronicleEntryTag>();
}
