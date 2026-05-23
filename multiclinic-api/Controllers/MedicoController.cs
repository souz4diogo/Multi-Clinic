using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiClinicAPI.Data;
using MultiClinicAPI.DTOs;
using MultiClinicAPI.Models;

namespace MultiClinicAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MedicoController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<Usuario> _passwordHasher;

    public MedicoController(AppDbContext context, IPasswordHasher<Usuario> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var medicos = await QueryComIncludes().ToListAsync();
        return Ok(medicos.Select(ToResponse));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var medico = await QueryComIncludes().FirstOrDefaultAsync(m => m.ID_Usuario == id);
        if (medico == null)
            return NotFound("Médico não encontrado.");

        return Ok(ToResponse(medico));
    }

    [HttpGet("{id}/agenda")]
    public async Task<IActionResult> Agenda(int id)
    {
        var horarios = await _context.Agendamentos
            .Where(a => a.ID_Medico == id && a.Status == "Agendado" && a.Data_Hora > DateTime.Now)
            .OrderBy(a => a.Data_Hora)
            .Select(a => a.Data_Hora)
            .ToListAsync();

        return Ok(horarios);
    }

    [HttpPost]
    [Authorize(Roles = "MedicoAdmin")]
    public async Task<IActionResult> Criar([FromBody] MedicoRequest request)
    {
        var emailEmUso = await _context.Usuarios.AnyAsync(u => u.Email == request.Email);
        if (emailEmUso)
            return BadRequest("E-mail já cadastrado.");

        var crmEmUso = await _context.Medicos.AnyAsync(m => m.CRM == request.CRM);
        if (crmEmUso)
            return BadRequest("CRM já cadastrado.");

        var especialidadeExiste = await _context.Especialidades.AnyAsync(e => e.ID_Especialidade == request.ID_Especialidade);
        if (!especialidadeExiste)
            return BadRequest("Especialidade não encontrada.");

        var medico = new Medico
        {
            Nome = request.Nome,
            Email = request.Email,
            Tipo_Perfil = "Medico",
            ID_Especialidade = request.ID_Especialidade,
            CRM = request.CRM
        };
        medico.Senha_Hash = _passwordHasher.HashPassword(medico, request.Senha);

        _context.Medicos.Add(medico);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(BuscarPorId), new { id = medico.ID_Usuario }, medico.ID_Usuario);
    }

    private IQueryable<Medico> QueryComIncludes() =>
        _context.Medicos
            .Include(m => m.Especialidade)
            .Include(m => m.Agendamentos)
                .ThenInclude(a => a.Avaliacao);

    private static MedicoResponse ToResponse(Medico m)
    {
        var notas = m.Agendamentos
            .Where(a => a.Avaliacao != null)
            .Select(a => a.Avaliacao!.Nota)
            .ToList();

        return new MedicoResponse
        {
            ID_Medico = m.ID_Usuario,
            Nome = m.Nome,
            CRM = m.CRM,
            Especialidade = m.Especialidade.Nome_Especialidade,
            MediaAvaliacao = notas.Count > 0 ? Math.Round((decimal)notas.Average(), 1) : 0,
            TotalAvaliacoes = notas.Count
        };
    }
}
