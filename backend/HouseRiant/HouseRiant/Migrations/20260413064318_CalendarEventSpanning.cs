using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HouseRiant.Migrations
{
    /// <inheritdoc />
    public partial class CalendarEventSpanning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EndDay",
                table: "CalendarEvents",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EndWeek",
                table: "CalendarEvents",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShortLabel",
                table: "CalendarEvents",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndDay",
                table: "CalendarEvents");

            migrationBuilder.DropColumn(
                name: "EndWeek",
                table: "CalendarEvents");

            migrationBuilder.DropColumn(
                name: "ShortLabel",
                table: "CalendarEvents");
        }
    }
}
