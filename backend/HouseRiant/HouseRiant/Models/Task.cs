namespace HouseRhiant.Api.Models;

public enum EstateTaskStatus
{
    Planned,
    InProgress,
    Completed,
    Blocked
}

public enum TaskPriority
{
    Low,
    Medium,
    High,
    Urgent
}

public enum TaskCategory
{
    Construction,
    Recruitment,
    Procurement,
    Military,
    Financial,
    Agricultural,
    Diplomatic,
    Other
}

public class EstateTask
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public EstateTaskStatus Status { get; set; } = EstateTaskStatus.Planned;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public TaskCategory Category { get; set; } = TaskCategory.Other;
    public decimal? CostTin { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentNotes { get; set; }
    public string? TargetDate { get; set; }
    public string? CompletedDate { get; set; }
    public string? Requirements { get; set; }
    public string? Outcome { get; set; }
    public string? Notes { get; set; }

    public int? BuildingId { get; set; }
    public Building? Building { get; set; }

    public int? AssignedFamilyId { get; set; }
    public Family? AssignedFamily { get; set; }

    public int? AssignedResidentId { get; set; }
    public Resident? AssignedResident { get; set; }

    public ICollection<CalendarEvent> CalendarEvents { get; set; } = new List<CalendarEvent>();
}
