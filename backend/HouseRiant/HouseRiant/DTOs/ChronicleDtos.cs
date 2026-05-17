namespace HouseRhiant.Api.DTOs;

public record TagSummary(int Id, string Name, string? Color);
public record LinkedPersonSummary(int Id, string Name);

public record ChronicleEntryResponse(
    int Id,
    string Title,
    string Body,
    string? EntryDate,
    DateTime CreatedAt,
    IEnumerable<TagSummary> Tags,
    IEnumerable<LinkedPersonSummary> Residents,
    IEnumerable<LinkedPersonSummary> NotableFigures
);

public record CreateChronicleEntryRequest(
    string Title,
    string Body,
    string? EntryDate,
    IEnumerable<int>? TagIds,
    IEnumerable<int>? ResidentIds,
    IEnumerable<int>? NotableFigureIds
);

public record TagResponse(int Id, string Name, string? Color);
public record CreateTagRequest(string Name, string? Color);
