namespace HouseRhiant.Api.DTOs;

public record PersonGroupResponse(
    int Id,
    string Name,
    string? Description,
    string? Color,
    int MemberCount
);

public record PersonGroupMemberResponse(
    int Id,
    int GroupId,
    int? ResidentId,
    string? ResidentName,
    string? ResidentImageUrl,
    int? NotableFigureId,
    string? NotableFigureName,
    string? NotableFigureImageUrl
);

public record CreatePersonGroupRequest(
    string Name,
    string? Description,
    string? Color
);

public record AddGroupMemberRequest(
    int? ResidentId,
    int? NotableFigureId
);

public record ReorderItem(int Id, int SortOrder);
