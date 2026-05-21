namespace MultiClinicAPI.DTOs;

public class EspecialidadeRequest
{
    public string Nome_Especialidade { get; set; } = string.Empty;
}

public class EspecialidadeResponse
{
    public int ID_Especialidade { get; set; }
    public string Nome_Especialidade { get; set; } = string.Empty;
}
