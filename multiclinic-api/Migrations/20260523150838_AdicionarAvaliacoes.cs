using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace multiclinic_api.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarAvaliacoes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Avaliacoes",
                columns: table => new
                {
                    ID_Avaliacao = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ID_Agendamento = table.Column<int>(type: "int", nullable: false),
                    Nota = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Avaliacoes", x => x.ID_Avaliacao);
                    table.ForeignKey(
                        name: "FK_Avaliacoes_Agendamentos_ID_Agendamento",
                        column: x => x.ID_Agendamento,
                        principalTable: "Agendamentos",
                        principalColumn: "ID_Agendamento",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Avaliacoes_ID_Agendamento",
                table: "Avaliacoes",
                column: "ID_Agendamento",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Avaliacoes");
        }
    }
}
