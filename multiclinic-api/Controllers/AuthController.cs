using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiClinicAPI.Data;
using MultiClinicAPI.DTOs;
using MultiClinicAPI.Models;
using MultiClinicAPI.Services;

namespace MultiClinicAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;
    private readonly IPasswordHasher<Usuario> _passwordHasher;

    public AuthController(AppDbContext context, TokenService tokenService, IPasswordHasher<Usuario> passwordHasher)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] RegisterRequest request)
    {
        var emailEmUso = await _context.Usuarios.AnyAsync(u => u.Email == request.Email);
        if (emailEmUso)
            return BadRequest("E-mail já cadastrado.");

        // Registro público sempre cria um Paciente (herda de Usuario)
        var paciente = new Paciente
        {
            Nome = request.Nome,
            Email = request.Email,
            Tipo_Perfil = "Paciente"
        };
        paciente.Senha_Hash = _passwordHasher.HashPassword(paciente, request.Senha);

        _context.Pacientes.Add(paciente);
        await _context.SaveChangesAsync();

        return Created(string.Empty, new { paciente.ID_Usuario, paciente.Nome, paciente.Email });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (usuario == null)
            return Unauthorized("E-mail ou senha inválidos.");

        var resultado = _passwordHasher.VerifyHashedPassword(usuario, usuario.Senha_Hash, request.Senha);
        if (resultado == PasswordVerificationResult.Failed)
            return Unauthorized("E-mail ou senha inválidos.");

        var token = _tokenService.Generate(usuario);

        // Com TPT, o ID do Paciente/Medico É o mesmo ID_Usuario
        return Ok(new LoginResponse
        {
            Token = token,
            Nome = usuario.Nome,
            Tipo_Perfil = usuario.Tipo_Perfil,
            ID_Usuario = usuario.ID_Usuario,
            ID_Paciente = usuario.Tipo_Perfil == "Paciente" ? usuario.ID_Usuario : null,
            ID_Medico = usuario.Tipo_Perfil == "Medico" ? usuario.ID_Usuario : null,
        });
    }
}
