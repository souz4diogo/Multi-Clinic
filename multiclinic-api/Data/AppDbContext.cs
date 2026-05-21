using Microsoft.EntityFrameworkCore;
using MultiClinicAPI.Models;

namespace MultiClinicAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(
        DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Usuario> Usuarios { get; set; }

    public DbSet<Medico> Medicos { get; set; }

    public DbSet<Paciente> Pacientes { get; set; }

    public DbSet<Especialidade> Especialidades { get; set; }

    public DbSet<Agendamento> Agendamentos { get; set; }

    public DbSet<Prontuario> Prontuarios { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Precisão do Score_Assiduidade (ex: 100.00)
        modelBuilder.Entity<Paciente>()
            .Property(p => p.Score_Assiduidade)
            .HasPrecision(5, 2);

        // Chaves primárias
        modelBuilder.Entity<Usuario>().HasKey(u => u.ID_Usuario);
        modelBuilder.Entity<Paciente>().HasKey(p => p.ID_Paciente);
        modelBuilder.Entity<Medico>().HasKey(m => m.ID_Medico);
        modelBuilder.Entity<Especialidade>().HasKey(e => e.ID_Especialidade);
        modelBuilder.Entity<Agendamento>().HasKey(a => a.ID_Agendamento);
        modelBuilder.Entity<Prontuario>().HasKey(p => p.ID_Prontuario);

        // Relacionamentos 1:1
        modelBuilder.Entity<Prontuario>()
            .HasOne(p => p.Agendamento)
            .WithOne(a => a.Prontuario)
            .HasForeignKey<Prontuario>(p => p.ID_Agendamento)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Medico>()
            .HasOne(m => m.Usuario)
            .WithOne(u => u.Medico)
            .HasForeignKey<Medico>(m => m.ID_Usuario)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Paciente>()
            .HasOne(p => p.Usuario)
            .WithOne(u => u.Paciente)
            .HasForeignKey<Paciente>(p => p.ID_Usuario)
            .OnDelete(DeleteBehavior.Restrict);

        // Relacionamentos 1:N
        modelBuilder.Entity<Medico>()
            .HasOne(m => m.Especialidade)
            .WithMany(e => e.Medicos)
            .HasForeignKey(m => m.ID_Especialidade)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Agendamento>()
            .HasOne(a => a.Paciente)
            .WithMany(p => p.Agendamentos)
            .HasForeignKey(a => a.ID_Paciente)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Agendamento>()
            .HasOne(a => a.Medico)
            .WithMany(m => m.Agendamentos)
            .HasForeignKey(a => a.ID_Medico)
            .OnDelete(DeleteBehavior.Restrict);
    }
}