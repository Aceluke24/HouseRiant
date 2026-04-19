using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HouseRiant.Migrations
{
    /// <inheritdoc />
    public partial class AddRecurrenceGroupId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RecurrenceGroupId",
                table: "CalendarEvents",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecurrenceGroupId",
                table: "CalendarEvents");
        }
    }
}
