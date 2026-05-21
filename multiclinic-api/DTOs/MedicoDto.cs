namespace MultiClinicAPI.DTOs;

public class MedicoRequest
{
    public int ID_Usuario { get; set; }
    public int ID_Especialidade { get; set; }
    public string CRM { get; set; } = string.Empty;
}

public class MedicoResponse
{
    public int ID_Medico { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string CRM { get; set; } = string.Empty;
    public string Especialidade { get; set; } = string.Empty;
}
