using Microsoft.AspNetCore.Mvc;
using MultiClinicAPI.Controllers;
using MultiClinicAPI.Data;
using MultiClinicAPI.DTOs;
using MultiClinicAPI.Models;
using MultiClinicAPI.Tests.Helpers;
using Xunit;

namespace MultiClinicAPI.Tests.Controllers;

public class AvaliacaoControllerTests
{
    private static AvaliacaoController CreateController(AppDbContext ctx, int userId) =>
        new(ctx) { ControllerContext = ControllerContextFactory.Create(userId, "Paciente") };

    private static async Task<(AppDbContext ctx, Paciente paciente, Agendamento agendamento)> SeedAgendamentoConcluido(string dbName)
    {
        var ctx = TestDbContextFactory.Create(dbName);

        var especialidade = new Especialidade { Nome_Especialidade = "Clínica" };
        ctx.Especialidades.Add(especialidade);
        await ctx.SaveChangesAsync();

        var medico = new Medico
        {
            Nome = "Dr. Luiz",
            Email = "luiz@test.com",
            Tipo_Perfil = "Medico",
            CRM = "CRM100",
            ID_Especialidade = especialidade.ID_Especialidade
        };
        ctx.Medicos.Add(medico);
        await ctx.SaveChangesAsync();

        var paciente = new Paciente { Nome = "Bia", Email = "bia@test.com", Tipo_Perfil = "Paciente" };
        ctx.Pacientes.Add(paciente);
        await ctx.SaveChangesAsync();

        var agendamento = new Agendamento
        {
            ID_Paciente = paciente.ID_Usuario,
            ID_Medico = medico.ID_Usuario,
            Data_Hora = DateTime.Now.AddDays(-1),
            Status = "Concluido"
        };
        ctx.Agendamentos.Add(agendamento);
        await ctx.SaveChangesAsync();

        return (ctx, paciente, agendamento);
    }

    [Fact]
    public async Task Avaliar_ComDadosValidos_Retorna201()
    {
        var dbName = nameof(Avaliar_ComDadosValidos_Retorna201);
        var (ctx, paciente, agendamento) = await SeedAgendamentoConcluido(dbName);

        var result = await CreateController(ctx, paciente.ID_Usuario)
            .Avaliar(new AvaliacaoRequest { ID_Agendamento = agendamento.ID_Agendamento, Nota = 5 });

        var created = Assert.IsType<CreatedResult>(result);
        var response = Assert.IsType<AvaliacaoResponse>(created.Value);
        Assert.Equal(5, response.Nota);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    public async Task Avaliar_ComNotaForaDointervalo_Retorna400(int nota)
    {
        var dbName = $"{nameof(Avaliar_ComNotaForaDointervalo_Retorna400)}_{nota}";
        var (ctx, paciente, agendamento) = await SeedAgendamentoConcluido(dbName);

        var result = await CreateController(ctx, paciente.ID_Usuario)
            .Avaliar(new AvaliacaoRequest { ID_Agendamento = agendamento.ID_Agendamento, Nota = nota });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Avaliar_AgendamentoNaoConcluido_Retorna400()
    {
        var dbName = nameof(Avaliar_AgendamentoNaoConcluido_Retorna400);
        var ctx = TestDbContextFactory.Create(dbName);

        var especialidade = new Especialidade { Nome_Especialidade = "Clínica" };
        ctx.Especialidades.Add(especialidade);
        await ctx.SaveChangesAsync();

        var medico = new Medico { Nome = "Dr.", Email = "dr@test.com", Tipo_Perfil = "Medico", CRM = "CRM200", ID_Especialidade = especialidade.ID_Especialidade };
        ctx.Medicos.Add(medico);
        var paciente = new Paciente { Nome = "Bia", Email = "bia2@test.com", Tipo_Perfil = "Paciente" };
        ctx.Pacientes.Add(paciente);
        await ctx.SaveChangesAsync();

        var agendamento = new Agendamento
        {
            ID_Paciente = paciente.ID_Usuario,
            ID_Medico = medico.ID_Usuario,
            Data_Hora = DateTime.Now.AddDays(1),
            Status = "Agendado"
        };
        ctx.Agendamentos.Add(agendamento);
        await ctx.SaveChangesAsync();

        var result = await CreateController(ctx, paciente.ID_Usuario)
            .Avaliar(new AvaliacaoRequest { ID_Agendamento = agendamento.ID_Agendamento, Nota = 4 });

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("concluíd", bad.Value!.ToString());
    }

    [Fact]
    public async Task Avaliar_JaAvaliada_Retorna400()
    {
        var dbName = nameof(Avaliar_JaAvaliada_Retorna400);
        var (ctx, paciente, agendamento) = await SeedAgendamentoConcluido(dbName);

        ctx.Avaliacoes.Add(new Avaliacao { ID_Agendamento = agendamento.ID_Agendamento, Nota = 4 });
        await ctx.SaveChangesAsync();

        var result = await CreateController(ctx, paciente.ID_Usuario)
            .Avaliar(new AvaliacaoRequest { ID_Agendamento = agendamento.ID_Agendamento, Nota = 5 });

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("avaliada", bad.Value!.ToString());
    }

    [Fact]
    public async Task Avaliar_PacienteNaoEDono_RetornaForbid()
    {
        var dbName = nameof(Avaliar_PacienteNaoEDono_RetornaForbid);
        var (ctx, _, agendamento) = await SeedAgendamentoConcluido(dbName);

        var outroPaciente = new Paciente { Nome = "Intruso", Email = "intruso@test.com", Tipo_Perfil = "Paciente" };
        ctx.Pacientes.Add(outroPaciente);
        await ctx.SaveChangesAsync();

        var result = await CreateController(ctx, outroPaciente.ID_Usuario)
            .Avaliar(new AvaliacaoRequest { ID_Agendamento = agendamento.ID_Agendamento, Nota = 3 });

        Assert.IsType<ForbidResult>(result);
    }
}
