using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace HouseRiant.Migrations
{
    /// <inheritdoc />
    public partial class ChronicleFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChronicleEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Body = table.Column<string>(type: "text", nullable: false),
                    EntryDate = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChronicleEntries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Color = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChronicleEntryNotableFigures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ChronicleEntryId = table.Column<int>(type: "integer", nullable: false),
                    NotableFigureId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChronicleEntryNotableFigures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChronicleEntryNotableFigures_ChronicleEntries_ChronicleEntr~",
                        column: x => x.ChronicleEntryId,
                        principalTable: "ChronicleEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChronicleEntryNotableFigures_NotableFigures_NotableFigureId",
                        column: x => x.NotableFigureId,
                        principalTable: "NotableFigures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChronicleEntryResidents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ChronicleEntryId = table.Column<int>(type: "integer", nullable: false),
                    ResidentId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChronicleEntryResidents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChronicleEntryResidents_ChronicleEntries_ChronicleEntryId",
                        column: x => x.ChronicleEntryId,
                        principalTable: "ChronicleEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChronicleEntryResidents_Residents_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Residents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChronicleEntryTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ChronicleEntryId = table.Column<int>(type: "integer", nullable: false),
                    TagId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChronicleEntryTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChronicleEntryTags_ChronicleEntries_ChronicleEntryId",
                        column: x => x.ChronicleEntryId,
                        principalTable: "ChronicleEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChronicleEntryTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChronicleEntryNotableFigures_ChronicleEntryId",
                table: "ChronicleEntryNotableFigures",
                column: "ChronicleEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_ChronicleEntryNotableFigures_NotableFigureId",
                table: "ChronicleEntryNotableFigures",
                column: "NotableFigureId");

            migrationBuilder.CreateIndex(
                name: "IX_ChronicleEntryResidents_ChronicleEntryId",
                table: "ChronicleEntryResidents",
                column: "ChronicleEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_ChronicleEntryResidents_ResidentId",
                table: "ChronicleEntryResidents",
                column: "ResidentId");

            migrationBuilder.CreateIndex(
                name: "IX_ChronicleEntryTags_ChronicleEntryId",
                table: "ChronicleEntryTags",
                column: "ChronicleEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_ChronicleEntryTags_TagId",
                table: "ChronicleEntryTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_Name",
                table: "Tags",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChronicleEntryNotableFigures");

            migrationBuilder.DropTable(
                name: "ChronicleEntryResidents");

            migrationBuilder.DropTable(
                name: "ChronicleEntryTags");

            migrationBuilder.DropTable(
                name: "ChronicleEntries");

            migrationBuilder.DropTable(
                name: "Tags");
        }
    }
}
