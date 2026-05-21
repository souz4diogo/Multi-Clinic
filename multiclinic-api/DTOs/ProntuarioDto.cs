namespace MultiClinicAPI.DTOs;

public class ProntuarioRequest
{
    public int ID_Agendamento { get; set; }
    public string? Evolucao_Clinica { get; set; }
    public string? Prescricao { get; set; }
}

public class ProntuarioResponse
{
    public int ID_Prontuario { get; set; }
    public int ID_Agendamento { get; set; }
    public string? Evolucao_Clinica { get; set; }
    public string? Prescricao { get; set; }
}
