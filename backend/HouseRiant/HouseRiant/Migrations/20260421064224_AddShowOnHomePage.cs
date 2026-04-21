using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HouseRiant.Migrations
{
    /// <inheritdoc />
    public partial class AddShowOnHomePage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ShowOnHomePage",
                table: "Residents",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShowOnHomePage",
                table: "Residents");
        }
    }
}
