namespace HouseRhiant.Api.Models;

public class ChronicleEntryTag
{
    public int Id { get; set; }
    public int ChronicleEntryId { get; set; }
    public ChronicleEntry ChronicleEntry { get; set; } = null!;
    public int TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}

public class ChronicleEntryResident
{
    public int Id { get; set; }
    public int ChronicleEntryId { get; set; }
    public ChronicleEntry ChronicleEntry { get; set; } = null!;
    public int ResidentId { get; set; }
    public Resident Resident { get; set; } = null!;
}

public class ChronicleEntryNotableFigure
{
    public int Id { get; set; }
    public int ChronicleEntryId { get; set; }
    public ChronicleEntry ChronicleEntry { get; set; } = null!;
    public int NotableFigureId { get; set; }
    public NotableFigure NotableFigure { get; set; } = null!;
}
