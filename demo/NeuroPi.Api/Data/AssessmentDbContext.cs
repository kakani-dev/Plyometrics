using Microsoft.EntityFrameworkCore;
using NeuroPi.Api.Models;

namespace NeuroPi.Api.Data
{
    public class AssessmentDbContext : DbContext
    {
        public AssessmentDbContext(DbContextOptions<AssessmentDbContext> options)
            : base(options)
        {
        }

        public DbSet<AssessmentSession> Sessions => Set<AssessmentSession>();
        public DbSet<StudentResponse> Responses => Set<StudentResponse>();
        public DbSet<Question> Questions => Set<Question>();
        public DbSet<AssessmentReport> Reports => Set<AssessmentReport>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Question config
            modelBuilder.Entity<Question>()
                .HasKey(q => q.QID);

            // Session config
            modelBuilder.Entity<AssessmentSession>()
                .HasKey(s => s.Id);

            modelBuilder.Entity<AssessmentSession>()
                .HasMany(s => s.Responses)
                .WithOne(r => r.Session)
                .HasForeignKey(r => r.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            // Response config
            modelBuilder.Entity<StudentResponse>()
                .HasKey(r => r.Id);

            // Report config
            modelBuilder.Entity<AssessmentReport>()
                .HasKey(r => r.Id);

            modelBuilder.Entity<AssessmentReport>()
                .HasOne(r => r.Session)
                .WithMany()
                .HasForeignKey(r => r.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
