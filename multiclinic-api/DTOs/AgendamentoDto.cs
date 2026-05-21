namespace MultiClinicAPI.DTOs;

public class AgendamentoRequest
{
    public int ID_Paciente { get; set; }
    public int ID_Medico { get; set; }
    public DateTime Data_Hora { get; set; }
}

public class AgendamentoAtualizarStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class AgendamentoResponse
{
    public int ID_Agendamento { get; set; }
    public string NomePaciente { get; set; } = string.Empty;
    public string NomeMedico { get; set; } = string.Empty;
    public DateTime Data_Hora { get; set; }
    public string Status { get; set; } = string.Empty;
}
