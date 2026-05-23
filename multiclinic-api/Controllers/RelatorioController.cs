using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiClinicAPI.Data;
using MultiClinicAPI.DTOs;

namespace MultiClinicAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RelatorioController : ControllerBase
{
    private readonly AppDbContext _context;

    public RelatorioController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Gerar()
    {
        // Totais gerais
        var totalMedicos = await _context.Medicos.CountAsync();
        var totalPacientes = await _context.Pacientes.CountAsync();

        // Consultas por status
        var agendamentos = await _context.Agendamentos.ToListAsync();
        var total = agendamentos.Count;
        var agendadas = agendamentos.Count(a => a.Status == "Agendado");
        var concluidas = agendamentos.Count(a => a.Status == "Concluido");
        var canceladas = agendamentos.Count(a => a.Status == "Cancelado");

        var taxaCancelamento = total > 0
            ? Math.Round((decimal)canceladas / total * 100, 1)
            : 0;

        // Média geral de avaliações
        var avaliacoes = await _context.Avaliacoes.Select(a => a.Nota).ToListAsync();
        var mediaAvaliacoes = avaliacoes.Count > 0
            ? Math.Round((decimal)avaliacoes.Average(), 1)
            : 0;

        // Médico mais bem avaliado
        var medicoMelhorAvaliado = await _context.Medicos
            .Include(m => m.Agendamentos).ThenInclude(a => a.Avaliacao)
            .Where(m => m.Agendamentos.Any(a => a.Avaliacao != null))
            .OrderByDescending(m => m.Agendamentos
                .Where(a => a.Avaliacao != null)
                .Average(a => a.Avaliacao!.Nota))
            .Select(m => m.Nome)
            .FirstOrDefaultAsync();

        // Especialidade mais procurada
        var especialidadeMaisProcurada = await _context.Agendamentos
            .Include(a => a.Medico).ThenInclude(m => m.Especialidade)
            .GroupBy(a => a.Medico.Especialidade.Nome_Especialidade)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .FirstOrDefaultAsync();

        // Score médio de assiduidade dos pacientes
        var scoreMedio = await _context.Pacientes.AnyAsync()
            ? Math.Round(await _context.Pacientes.AverageAsync(p => p.Score_Assiduidade), 1)
            : 0;

        return Ok(new RelatorioResponse
        {
            TotalMedicos = totalMedicos,
            TotalPacientes = totalPacientes,
            TotalConsultas = total,
            ConsultasAgendadas = agendadas,
            ConsultasConcluidas = concluidas,
            ConsultasCanceladas = canceladas,
            TaxaCancelamento = taxaCancelamento,
            MediaAvaliacoes = mediaAvaliacoes,
            MedicoMelhorAvaliado = medicoMelhorAvaliado ?? "Sem avaliações",
            EspecialidadeMaisProcurada = especialidadeMaisProcurada ?? "Sem dados",
            ScoreMedioAssiduidade = scoreMedio
        });
    }
}
