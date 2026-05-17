using System.Text.Json;
using HouseRhiant.Api.Models;

namespace HouseRhiant.Api.DTOs;

public record ResidentResponse(
    int Id,
    string Name,
    string Status,
    string? StatusOther,
    string? Title,
    string? Role,
    string? Type,
    string? Race,
    string? KrellTribe,
    string? Gender,
    int? Age,
    decimal? DailyPayRate,
    string? LandOwned,
    string? Appearance,
    string? Skills,
    string? TroopType,
    string? LevelOfRole,
    string? Notes,
    string? ImageUrl,
    int? FamilyId,
    string? FamilyName,
    int SortOrder,
    int? BuildingId,
    string? BuildingName,
    bool ShowOnHomePage
);

public record CreateResidentRequest(
    string Name,
    PersonStatus Status,
    string? StatusOther,
    string? Title,
    string? Role,
    string? Type,
    string? Race,
    string? KrellTribe,
    Gender? Gender,
    int? Age,
    decimal? DailyPayRate,
    string? LandOwned,
    string? Appearance,
    string? Skills,
    string? TroopType,
    string? LevelOfRole,
    string? Notes,
    string? ImageUrl,
    int? FamilyId,
    bool ShowOnHomePage = false
);

// ── Batch import ──────────────────────────────────────────

public class BatchResidentItemDto
{
    public string Name { get; set; } = string.Empty;
    public string? Status { get; set; }
    public string? StatusOther { get; set; }
    public string? Title { get; set; }
    public string? Role { get; set; }
    public string? Type { get; set; }
    public string? Race { get; set; }
    public string? KrellTribe { get; set; }
    public string? Gender { get; set; }
    public int? Age { get; set; }
    public decimal? DailyPayRate { get; set; }
    public string? LandOwned { get; set; }
    public string? Appearance { get; set; }
    public string? Skills { get; set; }
    public string? TroopType { get; set; }
    public string? LevelOfRole { get; set; }
    public string? Notes { get; set; }
    public string? ImageUrl { get; set; }
    public JsonElement? FamilyId { get; set; }
    public bool ShowOnHomePage { get; set; } = false;
}

public class BatchImportRequest
{
    public List<BatchResidentItemDto> Items { get; set; } = new();
}

public class BatchImportConflictDto
{
    public ResidentResponse Incoming { get; set; } = null!;
    public ResidentResponse Existing { get; set; } = null!;
}

public class BatchImportResponse
{
    public List<ResidentResponse> Created { get; set; } = new();
    public List<BatchImportConflictDto> Conflicts { get; set; } = new();
}
