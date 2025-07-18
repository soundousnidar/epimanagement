using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace hse1backend.Migrations
{
    /// <inheritdoc />
    public partial class AddTeConnectivityIdToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TeConnectivityId",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TeConnectivityId",
                table: "Users");
        }
    }
}
