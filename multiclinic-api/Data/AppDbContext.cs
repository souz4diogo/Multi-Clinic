using Microsoft.EntityFrameworkCore;
using MultiClinicAPI.Models;

namespace MultiClinicAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Paciente> Pacientes { get; set; }
    public DbSet<Medico> Medicos { get; set; }
    public DbSet<Especialidade> Especialidades { get; set; }
    public DbSet<Agendamento> Agendamentos { get; set; }
    public DbSet<Prontuario> Prontuarios { get; set; }
    public DbSet<Avaliacao> Avaliacoes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Herança: Paciente e Medico são tabelas separadas que estendem Usuarios (TPT)
        modelBuilder.Entity<Paciente>().ToTable("Pacientes");
        modelBuilder.Entity<Medico>().ToTable("Medicos");

        modelBuilder.Entity<Paciente>()
            .Property(p => p.Score_Assiduidade)
            .HasPrecision(5, 2);

        // Chaves
        modelBuilder.Entity<Especialidade>().HasKey(e => e.ID_Especialidade);
        modelBuilder.Entity<Agendamento>().HasKey(a => a.ID_Agendamento);
        modelBuilder.Entity<Prontuario>().HasKey(p => p.ID_Prontuario);
        modelBuilder.Entity<Avaliacao>().HasKey(a => a.ID_Avaliacao);

        // Medico → Especialidade (N:1)
        modelBuilder.Entity<Medico>()
            .HasOne(m => m.Especialidade)
            .WithMany(e => e.Medicos)
            .HasForeignKey(m => m.ID_Especialidade)
            .OnDelete(DeleteBehavior.Restrict);

        // Agendamento → Paciente (N:1)
        modelBuilder.Entity<Agendamento>()
            .HasOne(a => a.Paciente)
            .WithMany(p => p.Agendamentos)
            .HasForeignKey(a => a.ID_Paciente)
            .OnDelete(DeleteBehavior.Restrict);

        // Agendamento → Medico (N:1)
        modelBuilder.Entity<Agendamento>()
            .HasOne(a => a.Medico)
            .WithMany(m => m.Agendamentos)
            .HasForeignKey(a => a.ID_Medico)
            .OnDelete(DeleteBehavior.Restrict);

        // Prontuario ↔ Agendamento (1:1)
        modelBuilder.Entity<Prontuario>()
            .HasOne(p => p.Agendamento)
            .WithOne(a => a.Prontuario)
            .HasForeignKey<Prontuario>(p => p.ID_Agendamento)
            .OnDelete(DeleteBehavior.Restrict);

        // Avaliacao ↔ Agendamento (1:1)
        modelBuilder.Entity<Avaliacao>()
            .HasOne(av => av.Agendamento)
            .WithOne(ag => ag.Avaliacao)
            .HasForeignKey<Avaliacao>(av => av.ID_Agendamento)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
