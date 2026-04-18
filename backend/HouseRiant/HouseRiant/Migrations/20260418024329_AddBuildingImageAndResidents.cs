using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HouseRiant.Migrations
{
    /// <inheritdoc />
    public partial class AddBuildingImageAndResidents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BuildingId",
                table: "Residents",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Buildings",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Residents_BuildingId",
                table: "Residents",
                column: "BuildingId");

            migrationBuilder.AddForeignKey(
                name: "FK_Residents_Buildings_BuildingId",
                table: "Residents",
                column: "BuildingId",
                principalTable: "Buildings",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Residents_Buildings_BuildingId",
                table: "Residents");

            migrationBuilder.DropIndex(
                name: "IX_Residents_BuildingId",
                table: "Residents");

            migrationBuilder.DropColumn(
                name: "BuildingId",
                table: "Residents");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Buildings");
        }
    }
}
