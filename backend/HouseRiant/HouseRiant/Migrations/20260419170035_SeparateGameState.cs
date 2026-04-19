using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace HouseRiant.Migrations
{
    /// <inheritdoc />
    public partial class SeparateGameState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentDay",
                table: "EstateFinances");

            migrationBuilder.DropColumn(
                name: "CurrentSeason",
                table: "EstateFinances");

            migrationBuilder.DropColumn(
                name: "CurrentWeek",
                table: "EstateFinances");

            migrationBuilder.DropColumn(
                name: "CurrentYear",
                table: "EstateFinances");

            migrationBuilder.CreateTable(
                name: "GameStates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CurrentYear = table.Column<int>(type: "integer", nullable: false),
                    CurrentSeason = table.Column<string>(type: "text", nullable: true),
                    CurrentWeek = table.Column<string>(type: "text", nullable: true),
                    CurrentDay = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameStates", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "GameStates",
                columns: new[] { "Id", "CurrentDay", "CurrentSeason", "CurrentWeek", "CurrentYear" },
                values: new object[] { 1, 3, "Brón: Bás", null, 58 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GameStates");

            migrationBuilder.AddColumn<int>(
                name: "CurrentDay",
                table: "EstateFinances",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CurrentSeason",
                table: "EstateFinances",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentWeek",
                table: "EstateFinances",
                type: "text",
                nullable: true);

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
    }
}
