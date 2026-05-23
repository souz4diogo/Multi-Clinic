namespace MultiClinicAPI.DTOs;

public class RelatorioResponse
{
    public int TotalMedicos { get; set; }
    public int TotalPacientes { get; set; }
    public int TotalConsultas { get; set; }
    public int ConsultasAgendadas { get; set; }
    public int ConsultasConcluidas { get; set; }
    public int ConsultasCanceladas { get; set; }
    public decimal TaxaCancelamento { get; set; }
    public decimal MediaAvaliacoes { get; set; }
    public string MedicoMelhorAvaliado { get; set; } = string.Empty;
    public string EspecialidadeMaisProcurada { get; set; } = string.Empty;
    public decimal ScoreMedioAssiduidade { get; set; }
}
