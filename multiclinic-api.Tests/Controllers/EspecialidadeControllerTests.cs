using Microsoft.AspNetCore.Mvc;
using MultiClinicAPI.Controllers;
using MultiClinicAPI.DTOs;
using MultiClinicAPI.Models;
using MultiClinicAPI.Tests.Helpers;
using Xunit;

namespace MultiClinicAPI.Tests.Controllers;

public class EspecialidadeControllerTests
{
    private static EspecialidadeController CreateController(string dbName) =>
        new(TestDbContextFactory.Create(dbName))
        {
            ControllerContext = ControllerContextFactory.Create(1, "MedicoAdmin")
        };

    [Fact]
    public async Task Listar_RetornaTodasEspecialidades()
    {
        var dbName = nameof(Listar_RetornaTodasEspecialidades);
        var ctx = TestDbContextFactory.Create(dbName);
        ctx.Especialidades.AddRange(
            new Especialidade { Nome_Especialidade = "Cardiologia" },
            new Especialidade { Nome_Especialidade = "Pediatria" }
        );
        await ctx.SaveChangesAsync();

        var result = await new EspecialidadeController(ctx).Listar();

        var ok = Assert.IsType<OkObjectResult>(result);
        var lista = Assert.IsAssignableFrom<IEnumerable<EspecialidadeResponse>>(ok.Value);
        Assert.Equal(2, lista.Count());
    }

    [Fact]
    public async Task BuscarPorId_ComIdExistente_RetornaOk()
    {
        var dbName = nameof(BuscarPorId_ComIdExistente_RetornaOk);
        var ctx = TestDbContextFactory.Create(dbName);
        var esp = new Especialidade { Nome_Especialidade = "Ortopedia" };
        ctx.Especialidades.Add(esp);
        await ctx.SaveChangesAsync();

        var result = await new EspecialidadeController(ctx).BuscarPorId(esp.ID_Especialidade);

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<EspecialidadeResponse>(ok.Value);
        Assert.Equal("Ortopedia", response.Nome_Especialidade);
    }

    [Fact]
    public async Task BuscarPorId_ComIdInexistente_Retorna404()
    {
        var result = await CreateController(nameof(BuscarPorId_ComIdInexistente_Retorna404))
            .BuscarPorId(9999);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task Criar_RetornaCreated()
    {
        var result = await CreateController(nameof(Criar_RetornaCreated))
            .Criar(new EspecialidadeRequest { Nome_Especialidade = "Neurologia" });

        var created = Assert.IsType<CreatedAtActionResult>(result);
        var response = Assert.IsType<EspecialidadeResponse>(created.Value);
        Assert.Equal("Neurologia", response.Nome_Especialidade);
    }

    [Fact]
    public async Task Deletar_SemMedicosAssociados_Retorna204()
    {
        var dbName = nameof(Deletar_SemMedicosAssociados_Retorna204);
        var ctx = TestDbContextFactory.Create(dbName);
        var esp = new Especialidade { Nome_Especialidade = "Dermatologia" };
        ctx.Especialidades.Add(esp);
        await ctx.SaveChangesAsync();

        var result = await new EspecialidadeController(ctx).Deletar(esp.ID_Especialidade);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Deletar_ComMedicosAssociados_Retorna400()
    {
        var dbName = nameof(Deletar_ComMedicosAssociados_Retorna400);
        var ctx = TestDbContextFactory.Create(dbName);
        var esp = new Especialidade { Nome_Especialidade = "Ginecologia" };
        ctx.Especialidades.Add(esp);
        await ctx.SaveChangesAsync();

        ctx.Medicos.Add(new Medico
        {
            Nome = "Dra. Carla",
            Email = "carla@test.com",
            Tipo_Perfil = "Medico",
            CRM = "CRM999",
            ID_Especialidade = esp.ID_Especialidade
        });
        await ctx.SaveChangesAsync();

        var result = await new EspecialidadeController(ctx).Deletar(esp.ID_Especialidade);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("médicos", bad.Value!.ToString());
    }
}
