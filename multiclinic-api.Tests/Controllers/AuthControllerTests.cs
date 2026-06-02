using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MultiClinicAPI.Controllers;
using MultiClinicAPI.DTOs;
using MultiClinicAPI.Models;
using MultiClinicAPI.Services;
using MultiClinicAPI.Tests.Helpers;
using Xunit;

namespace MultiClinicAPI.Tests.Controllers;

public class AuthControllerTests
{
    private static AuthController CreateController(string dbName)
    {
        var context = TestDbContextFactory.Create(dbName);
        return new AuthController(context, new TokenService(), new PasswordHasher<Usuario>());
    }

    [Fact]
    public async Task Registrar_ComEmailNovo_Retorna201()
    {
        var controller = CreateController(nameof(Registrar_ComEmailNovo_Retorna201));

        var result = await controller.Registrar(new RegisterRequest
        {
            Nome = "Ana", Email = "ana@test.com", Senha = "Senha123"
        });

        Assert.IsType<CreatedResult>(result);
    }

    [Fact]
    public async Task Registrar_ComEmailDuplicado_Retorna400()
    {
        var dbName = nameof(Registrar_ComEmailDuplicado_Retorna400);
        await SeedPacienteAsync(dbName, "existente@test.com");

        var result = await CreateController(dbName).Registrar(new RegisterRequest
        {
            Nome = "Novo", Email = "existente@test.com", Senha = "Senha123"
        });

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("cadastrado", bad.Value!.ToString());
    }

    [Fact]
    public async Task Login_ComCredenciaisValidas_RetornaTokenEPerfil()
    {
        var dbName = nameof(Login_ComCredenciaisValidas_RetornaTokenEPerfil);
        await SeedPacienteAsync(dbName, "ana@test.com", nome: "Ana", senha: "Senha123");

        var result = await CreateController(dbName).Login(new LoginRequest
        {
            Email = "ana@test.com", Senha = "Senha123"
        });

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<LoginResponse>(ok.Value);
        Assert.NotEmpty(response.Token);
        Assert.Equal("Ana", response.Nome);
        Assert.Equal("Paciente", response.Tipo_Perfil);
        Assert.NotNull(response.ID_Paciente);
        Assert.Null(response.ID_Medico);
    }

    [Fact]
    public async Task Login_ComEmailDesconhecido_Retorna401()
    {
        var result = await CreateController(nameof(Login_ComEmailDesconhecido_Retorna401))
            .Login(new LoginRequest { Email = "naoexiste@test.com", Senha = "qualquer" });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Login_ComSenhaErrada_Retorna401()
    {
        var dbName = nameof(Login_ComSenhaErrada_Retorna401);
        await SeedPacienteAsync(dbName, "bob@test.com", senha: "SenhaCorreta");

        var result = await CreateController(dbName).Login(new LoginRequest
        {
            Email = "bob@test.com", Senha = "SenhaErrada"
        });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    private static async Task SeedPacienteAsync(string dbName, string email, string nome = "Test", string senha = "Senha123")
    {
        var ctx = TestDbContextFactory.Create(dbName);
        var hasher = new PasswordHasher<Usuario>();
        var paciente = new Paciente { Nome = nome, Email = email, Tipo_Perfil = "Paciente" };
        paciente.Senha_Hash = hasher.HashPassword(paciente, senha);
        ctx.Pacientes.Add(paciente);
        await ctx.SaveChangesAsync();
    }
}
