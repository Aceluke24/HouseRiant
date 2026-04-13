namespace HouseRhiant.Api.DTOs;

// What the API sends back to the frontend
public class FamilyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Origin { get; set; }
    public string? Expertise { get; set; }
    public string? Motto { get; set; }
    public string? HeadOfFamily { get; set; }
    public string? Relationship { get; set; }
    public string? Allegiance { get; set; }
    public string? Notes { get; set; }

    // Counts — computed from navigation properties, not stored in DB
    public int ResidentCount { get; set; }
    public int NotableFigureCount { get; set; }
}

// What the frontend sends when creating or updating a family
public class CreateFamilyDto
{
    public string Name { get; set; } = string.Empty;
    public string? Origin { get; set; }
    public string? Expertise { get; set; }
    public string? Motto { get; set; }
    public string? HeadOfFamily { get; set; }
    public string? Relationship { get; set; }
    public string? Allegiance { get; set; }
    public string? Notes { get; set; }
}
