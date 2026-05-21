using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace multiclinic_api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Especialidades",
                columns: table => new
                {
                    ID_Especialidade = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome_Especialidade = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Especialidades", x => x.ID_Especialidade);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    ID_Usuario = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Senha_Hash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tipo_Perfil = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.ID_Usuario);
                });

            migrationBuilder.CreateTable(
                name: "Medicos",
                columns: table => new
                {
                    ID_Medico = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ID_Usuario = table.Column<int>(type: "int", nullable: false),
                    ID_Especialidade = table.Column<int>(type: "int", nullable: false),
                    CRM = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicos", x => x.ID_Medico);
                    table.ForeignKey(
                        name: "FK_Medicos_Especialidades_ID_Especialidade",
                        column: x => x.ID_Especialidade,
                        principalTable: "Especialidades",
                        principalColumn: "ID_Especialidade",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Medicos_Usuarios_ID_Usuario",
                        column: x => x.ID_Usuario,
                        principalTable: "Usuarios",
                        principalColumn: "ID_Usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Pacientes",
                columns: table => new
                {
                    ID_Paciente = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ID_Usuario = table.Column<int>(type: "int", nullable: false),
                    CPF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Data_Nascimento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Score_Assiduidade = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pacientes", x => x.ID_Paciente);
                    table.ForeignKey(
                        name: "FK_Pacientes_Usuarios_ID_Usuario",
                        column: x => x.ID_Usuario,
                        principalTable: "Usuarios",
                        principalColumn: "ID_Usuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Agendamentos",
                columns: table => new
                {
                    ID_Agendamento = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ID_Paciente = table.Column<int>(type: "int", nullable: false),
                    ID_Medico = table.Column<int>(type: "int", nullable: false),
                    Data_Hora = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Agendamentos", x => x.ID_Agendamento);
                    table.ForeignKey(
                        name: "FK_Agendamentos_Medicos_ID_Medico",
                        column: x => x.ID_Medico,
                        principalTable: "Medicos",
                        principalColumn: "ID_Medico",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Agendamentos_Pacientes_ID_Paciente",
                        column: x => x.ID_Paciente,
                        principalTable: "Pacientes",
                        principalColumn: "ID_Paciente",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Prontuarios",
                columns: table => new
                {
                    ID_Prontuario = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ID_Agendamento = table.Column<int>(type: "int", nullable: false),
                    Evolucao_Clinica = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Prescricao = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prontuarios", x => x.ID_Prontuario);
                    table.ForeignKey(
                        name: "FK_Prontuarios_Agendamentos_ID_Agendamento",
                        column: x => x.ID_Agendamento,
                        principalTable: "Agendamentos",
                        principalColumn: "ID_Agendamento",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_ID_Medico",
                table: "Agendamentos",
                column: "ID_Medico");

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_ID_Paciente",
                table: "Agendamentos",
                column: "ID_Paciente");

            migrationBuilder.CreateIndex(
                name: "IX_Medicos_ID_Especialidade",
                table: "Medicos",
                column: "ID_Especialidade");

            migrationBuilder.CreateIndex(
                name: "IX_Medicos_ID_Usuario",
                table: "Medicos",
                column: "ID_Usuario",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_ID_Usuario",
                table: "Pacientes",
                column: "ID_Usuario",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Prontuarios_ID_Agendamento",
                table: "Prontuarios",
                column: "ID_Agendamento",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Prontuarios");

            migrationBuilder.DropTable(
                name: "Agendamentos");

            migrationBuilder.DropTable(
                name: "Medicos");

            migrationBuilder.DropTable(
                name: "Pacientes");

            migrationBuilder.DropTable(
                name: "Especialidades");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
