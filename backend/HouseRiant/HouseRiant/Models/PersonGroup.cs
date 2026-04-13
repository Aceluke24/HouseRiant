namespace HouseRhiant.Api.Models;

public class PersonGroup
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }

    public ICollection<PersonGroupMember> Members { get; set; } = new List<PersonGroupMember>();
}
