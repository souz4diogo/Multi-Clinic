namespace MultiClinicAPI.DTOs;

public class PacienteRequest
{
    public int ID_Usuario { get; set; }
    public string CPF { get; set; } = string.Empty;
    public DateTime Data_Nascimento { get; set; }
}

public class PacienteResponse
{
    public int ID_Paciente { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string CPF { get; set; } = string.Empty;
    public DateTime Data_Nascimento { get; set; }
    public decimal Score_Assiduidade { get; set; }
}
