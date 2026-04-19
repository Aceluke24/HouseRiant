using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HouseRiant.Migrations
{
    /// <inheritdoc />
    public partial class AddStructuredGameDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CurrentGameDate",
                table: "EstateFinances",
                newName: "CurrentWeek");

            migrationBuilder.AddColumn<int>(
                name: "CurrentDay",
                table: "EstateFinances",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CurrentYear",
                table: "EstateFinances",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "EstateFinances",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CurrentDay", "CurrentSeason", "CurrentWeek", "CurrentYear" },
                values: new object[] { 3, "Brón: Bás", null, 58 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentDay",
                table: "EstateFinances");

            migrationBuilder.DropColumn(
                name: "CurrentYear",
                table: "EstateFinances");

            migrationBuilder.RenameColumn(
                name: "CurrentWeek",
                table: "EstateFinances",
                newName: "CurrentGameDate");

            migrationBuilder.UpdateData(
                table: "EstateFinances",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CurrentGameDate", "CurrentSeason" },
                values: new object[] { "3rd of Brón: Bás", "Malthana's Harvest" });
        }
    }
}
