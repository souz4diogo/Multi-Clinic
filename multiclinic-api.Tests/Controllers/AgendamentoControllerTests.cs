using Microsoft.AspNetCore.Mvc;
using MultiClinicAPI.Controllers;
using MultiClinicAPI.Data;
using MultiClinicAPI.DTOs;
using MultiClinicAPI.Models;
using MultiClinicAPI.Tests.Helpers;
using Xunit;

namespace MultiClinicAPI.Tests.Controllers;

public class AgendamentoControllerTests
{
    private static AgendamentoController CreateController(AppDbContext ctx, int userId, string role)
    {
        return new AgendamentoController(ctx)
        {
            ControllerContext = ControllerContextFactory.Create(userId, role)
        };
    }

    private static async Task<(AppDbContext ctx, Paciente paciente, Medico medico)> SeedBaseAsync(string dbName)
    {
        var ctx = TestDbContextFactory.Create(dbName);

        var especialidade = new Especialidade { Nome_Especialidade = "Cardiologia" };
        ctx.Especialidades.Add(especialidade);
        await ctx.SaveChangesAsync();

        var medico = new Medico
        {
            Nome = "Dr. João",
            Email = "drjoao@test.com",
            Tipo_Perfil = "Medico",
            CRM = "CRM001",
            ID_Especialidade = especialidade.ID_Especialidade
        };
        ctx.Medicos.Add(medico);
        await ctx.SaveChangesAsync();

        var paciente = new Paciente
        {
            Nome = "Maria",
            Email = "maria@test.com",
            Tipo_Perfil = "Paciente",
            CPF = "12345678901"
        };
        ctx.Pacientes.Add(paciente);
        await ctx.SaveChangesAsync();

        return (ctx, paciente, medico);
    }

    [Fact]
    public async Task Listar_ComoMedicoAdmin_RetornaTodosAgendamentos()
    {
        var dbName = nameof(Listar_ComoMedicoAdmin_RetornaTodosAgendamentos);
        var (ctx, paciente, medico) = await SeedBaseAsync(dbName);

        ctx.Agendamentos.AddRange(
            new Agendamento { ID_Paciente = paciente.ID_Usuario, ID_Medico = medico.ID_Usuario, Data_Hora = DateTime.Now.AddDays(1), Status = "Agendado" },
            new Agendamento { ID_Paciente = paciente.ID_Usuario, ID_Medico = medico.ID_Usuario, Data_Hora = DateTime.Now.AddDays(2), Status = "Agendado" }
        );
        await ctx.SaveChangesAsync();

        var controller = CreateController(ctx, userId: 99, role: "MedicoAdmin");
        var result = await controller.Listar();

        var ok = Assert.IsType<OkObjectResult>(result);
        var lista = Assert.IsAssignableFrom<IEnumerable<AgendamentoResponse>>(ok.Value);
        Assert.Equal(2, lista.Count());
    }

    [Fact]
    public async Task Listar_ComoPaciente_RetornaApenasPropriosAgendamentos()
    {
        var dbName = nameof(Listar_ComoPaciente_RetornaApenasPropriosAgendamentos);
        var (ctx, paciente, medico) = await SeedBaseAsync(dbName);

        var paciente2 = new Paciente { Nome = "Pedro", Email = "pedro@test.com", Tipo_Perfil = "Paciente", CPF = "99999999999" };
        ctx.Pacientes.Add(paciente2);
        await ctx.SaveChangesAsync();

        ctx.Agendamentos.AddRange(
            new Agendamento { ID_Paciente = paciente.ID_Usuario, ID_Medico = medico.ID_Usuario, Data_Hora = DateTime.Now.AddDays(1), Status = "Agendado" },
            new Agendamento { ID_Paciente = paciente2.ID_Usuario, ID_Medico = medico.ID_Usuario, Data_Hora = DateTime.Now.AddDays(2), Status = "Agendado" }
        );
        await ctx.SaveChangesAsync();

        var controller = CreateController(ctx, userId: paciente.ID_Usuario, role: "Paciente");
        var result = await controller.Listar();

        var ok = Assert.IsType<OkObjectResult>(result);
        var lista = Assert.IsAssignableFrom<IEnumerable<AgendamentoResponse>>(ok.Value);
        Assert.Single(lista);
        Assert.All(lista, a => Assert.Equal(paciente.ID_Usuario, a.ID_Paciente));
    }

    [Fact]
    public async Task Criar_ComMedicoAdmin_RetornaCriado()
    {
        var dbName = nameof(Criar_ComMedicoAdmin_RetornaCriado);
        var (ctx, paciente, medico) = await SeedBaseAsync(dbName);

        var controller = CreateController(ctx, userId: 99, role: "MedicoAdmin");
        var result = await controller.Criar(new AgendamentoRequest
        {
            ID_Paciente = paciente.ID_Usuario,
            ID_Medico = medico.ID_Usuario,
            Data_Hora = DateTime.Now.AddDays(3)
        });

        Assert.IsType<CreatedAtActionResult>(result);
    }

    [Fact]
    public async Task Criar_ComDataPassada_Retorna400()
    {
        var dbName = nameof(Criar_ComDataPassada_Retorna400);
        var (ctx, paciente, medico) = await SeedBaseAsync(dbName);

        var controller = CreateController(ctx, userId: 99, role: "MedicoAdmin");
        var result = await controller.Criar(new AgendamentoRequest
        {
            ID_Paciente = paciente.ID_Usuario,
            ID_Medico = medico.ID_Usuario,
            Data_Hora = DateTime.Now.AddDays(-1)
        });

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("futura", bad.Value!.ToString());
    }

    [Fact]
    public async Task Criar_PacienteSemCPF_Retorna400()
    {
        var dbName = nameof(Criar_PacienteSemCPF_Retorna400);
        var (ctx, _, medico) = await SeedBaseAsync(dbName);

        var pacienteSemCpf = new Paciente { Nome = "SemCPF", Email = "semcpf@test.com", Tipo_Perfil = "Paciente", CPF = "" };
        ctx.Pacientes.Add(pacienteSemCpf);
        await ctx.SaveChangesAsync();

        var controller = CreateController(ctx, userId: pacienteSemCpf.ID_Usuario, role: "Paciente");
        var result = await controller.Criar(new AgendamentoRequest
        {
            ID_Medico = medico.ID_Usuario,
            Data_Hora = DateTime.Now.AddDays(1)
        });

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("perfil", bad.Value!.ToString());
    }

    [Fact]
    public async Task AtualizarStatus_ComStatusValido_Retorna204()
    {
        var dbName = nameof(AtualizarStatus_ComStatusValido_Retorna204);
        var (ctx, paciente, medico) = await SeedBaseAsync(dbName);

        var agendamento = new Agendamento
        {
            ID_Paciente = paciente.ID_Usuario,
            ID_Medico = medico.ID_Usuario,
            Data_Hora = DateTime.Now.AddDays(1),
            Status = "Agendado"
        };
        ctx.Agendamentos.Add(agendamento);
        await ctx.SaveChangesAsync();

        var controller = CreateController(ctx, userId: 99, role: "MedicoAdmin");
        var result = await controller.AtualizarStatus(
            agendamento.ID_Agendamento,
            new AgendamentoAtualizarStatusRequest { Status = "Concluido" }
        );

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task AtualizarStatus_ComStatusInvalido_Retorna400()
    {
        var dbName = nameof(AtualizarStatus_ComStatusInvalido_Retorna400);
        var (ctx, paciente, medico) = await SeedBaseAsync(dbName);

        var agendamento = new Agendamento
        {
            ID_Paciente = paciente.ID_Usuario,
            ID_Medico = medico.ID_Usuario,
            Data_Hora = DateTime.Now.AddDays(1),
            Status = "Agendado"
        };
        ctx.Agendamentos.Add(agendamento);
        await ctx.SaveChangesAsync();

        var controller = CreateController(ctx, userId: 99, role: "MedicoAdmin");
        var result = await controller.AtualizarStatus(
            agendamento.ID_Agendamento,
            new AgendamentoAtualizarStatusRequest { Status = "StatusInexistente" }
        );

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("inválido", bad.Value!.ToString());
    }
}
