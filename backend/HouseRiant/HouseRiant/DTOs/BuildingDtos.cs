namespace HouseRhiant.Api.DTOs;

// What the API sends back to the frontend
public class BuildingDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Condition { get; set; } = string.Empty;
    public int? CapacityPersons { get; set; }
    public int? StorageCapacityLbs { get; set; }
    public bool IsLivable { get; set; }
    public string? ImageUrl { get; set; }
    public string? ImagePosition { get; set; }
    public string? Notes { get; set; }

    // Linked tasks — id + name + status only
    public List<BuildingTaskSummaryDto> Tasks { get; set; } = new();

    // Primary residents (one building per resident via FK)
    public List<BuildingResidentSummaryDto> Residents { get; set; } = new();

    // Secondary assignments (many-to-many — workplaces, posts, etc.)
    public List<BuildingAssignmentDto> Assignments { get; set; } = new();
}

public class BuildingTaskSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class BuildingResidentSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}

public class BuildingAssignmentDto
{
    public int Id { get; set; }
    public int ResidentId { get; set; }
    public string ResidentName { get; set; } = string.Empty;
    public string? ResidentImageUrl { get; set; }
    public string? AssignmentType { get; set; }
}

public class CreateBuildingAssignmentDto
{
    public int ResidentId { get; set; }
    public string? AssignmentType { get; set; }
}

// What the frontend sends when creating or updating a building
public class CreateBuildingDto
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Condition { get; set; } = string.Empty;
    public int? CapacityPersons { get; set; }
    public int? StorageCapacityLbs { get; set; }
    public bool IsLivable { get; set; }
    public string? ImageUrl { get; set; }
    public string? ImagePosition { get; set; }
    public string? Notes { get; set; }
}
