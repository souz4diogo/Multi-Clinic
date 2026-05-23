namespace MultiClinicAPI.Models;

public class Avaliacao
{
    public int ID_Avaliacao { get; set; }
    public int ID_Agendamento { get; set; }
    public int Nota { get; set; }

    public Agendamento Agendamento { get; set; } = null!;
}
