using Microsoft.AspNetCore.Mvc;
using MultiClinicAPI.Controllers;
using MultiClinicAPI.DTOs;
using MultiClinicAPI.Models;
using MultiClinicAPI.Tests.Helpers;
using Xunit;

namespace MultiClinicAPI.Tests.Controllers;

public class RelatorioControllerTests
{
    [Fact]
    public async Task Gerar_BancoDeDadosVazio_RetornaZerosEMensagesPadrao()
    {
        var ctx = TestDbContextFactory.Create(nameof(Gerar_BancoDeDadosVazio_RetornaZerosEMensagesPadrao));

        var result = await new RelatorioController(ctx).Gerar();

        var ok = Assert.IsType<OkObjectResult>(result);
        var relatorio = Assert.IsType<RelatorioResponse>(ok.Value);
        Assert.Equal(0, relatorio.TotalMedicos);
        Assert.Equal(0, relatorio.TotalPacientes);
        Assert.Equal(0, relatorio.TotalConsultas);
        Assert.Equal(0, relatorio.MediaAvaliacoes);
        Assert.Equal("Sem avaliações", relatorio.MedicoMelhorAvaliado);
        Assert.Equal("Sem dados", relatorio.EspecialidadeMaisProcurada);
    }

    [Fact]
    public async Task Gerar_ComDados_RetornaContagensCorretas()
    {
        var dbName = nameof(Gerar_ComDados_RetornaContagensCorretas);
        var ctx = TestDbContextFactory.Create(dbName);

        var especialidade = new Especialidade { Nome_Especialidade = "Cardiologia" };
        ctx.Especialidades.Add(especialidade);
        await ctx.SaveChangesAsync();

        var medico = new Medico
        {
            Nome = "Dr. Ana",
            Email = "driana@test.com",
            Tipo_Perfil = "Medico",
            CRM = "CRM001",
            ID_Especialidade = especialidade.ID_Especialidade
        };
        ctx.Medicos.Add(medico);

        var paciente = new Paciente { Nome = "Carlos", Email = "carlos@test.com", Tipo_Perfil = "Paciente", Score_Assiduidade = 90 };
        ctx.Pacientes.Add(paciente);
        await ctx.SaveChangesAsync();

        ctx.Agendamentos.AddRange(
            new Agendamento { ID_Paciente = paciente.ID_Usuario, ID_Medico = medico.ID_Usuario, Data_Hora = DateTime.Now.AddDays(-3), Status = "Concluido" },
            new Agendamento { ID_Paciente = paciente.ID_Usuario, ID_Medico = medico.ID_Usuario, Data_Hora = DateTime.Now.AddDays(-2), Status = "Cancelado" },
            new Agendamento { ID_Paciente = paciente.ID_Usuario, ID_Medico = medico.ID_Usuario, Data_Hora = DateTime.Now.AddDays(1), Status = "Agendado" }
        );
        await ctx.SaveChangesAsync();

        var agendamentoConcluido = ctx.Agendamentos.First(a => a.Status == "Concluido");
        ctx.Avaliacoes.Add(new Avaliacao { ID_Agendamento = agendamentoConcluido.ID_Agendamento, Nota = 4 });
        await ctx.SaveChangesAsync();

        var result = await new RelatorioController(ctx).Gerar();

        var ok = Assert.IsType<OkObjectResult>(result);
        var relatorio = Assert.IsType<RelatorioResponse>(ok.Value);
        Assert.Equal(1, relatorio.TotalMedicos);
        Assert.Equal(1, relatorio.TotalPacientes);
        Assert.Equal(3, relatorio.TotalConsultas);
        Assert.Equal(1, relatorio.ConsultasAgendadas);
        Assert.Equal(1, relatorio.ConsultasConcluidas);
        Assert.Equal(1, relatorio.ConsultasCanceladas);
        Assert.Equal(4.0m, relatorio.MediaAvaliacoes);
        Assert.Equal("Dr. Ana", relatorio.MedicoMelhorAvaliado);
        Assert.Equal("Cardiologia", relatorio.EspecialidadeMaisProcurada);
        Assert.Equal(90m, relatorio.ScoreMedioAssiduidade);
    }

    [Fact]
    public async Task Gerar_TaxaCancelamento_CalculadaCorretamente()
    {
        var dbName = nameof(Gerar_TaxaCancelamento_CalculadaCorretamente);
        var ctx = TestDbContextFactory.Create(dbName);

        var especialidade = new Especialidade { Nome_Especialidade = "Clínica" };
        ctx.Especialidades.Add(especialidade);
        await ctx.SaveChangesAsync();

        var medico = new Medico { Nome = "Dr.", Email = "dr@test.com", Tipo_Perfil = "Medico", CRM = "CRM002", ID_Especialidade = especialidade.ID_Especialidade };
        ctx.Medicos.Add(medico);
        var paciente = new Paciente { Nome = "P", Email = "p@test.com", Tipo_Perfil = "Paciente" };
        ctx.Pacientes.Add(paciente);
        await ctx.SaveChangesAsync();

        ctx.Agendamentos.AddRange(
            new Agendamento { ID_Paciente = paciente.ID_Usuario, ID_Medico = medico.ID_Usuario, Data_Hora = DateTime.Now, Status = "Cancelado" },
            new Agendamento { ID_Paciente = paciente.ID_Usuario, ID_Medico = medico.ID_Usuario, Data_Hora = DateTime.Now, Status = "Cancelado" },
            new Agendamento { ID_Paciente = paciente.ID_Usuario, ID_Medico = medico.ID_Usuario, Data_Hora = DateTime.Now, Status = "Agendado" },
            new Agendamento { ID_Paciente = paciente.ID_Usuario, ID_Medico = medico.ID_Usuario, Data_Hora = DateTime.Now, Status = "Agendado" }
        );
        await ctx.SaveChangesAsync();

        var result = await new RelatorioController(ctx).Gerar();

        var ok = Assert.IsType<OkObjectResult>(result);
        var relatorio = Assert.IsType<RelatorioResponse>(ok.Value);
        Assert.Equal(50.0m, relatorio.TaxaCancelamento);
    }
}
