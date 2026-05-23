namespace MultiClinicAPI.DTOs;

public class AvaliacaoRequest
{
    public int ID_Agendamento { get; set; }
    public int Nota { get; set; }
}

public class AvaliacaoResponse
{
    public int ID_Avaliacao { get; set; }
    public int ID_Agendamento { get; set; }
    public int Nota { get; set; }
}
