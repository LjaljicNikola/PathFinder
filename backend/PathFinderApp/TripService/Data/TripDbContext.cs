using Microsoft.EntityFrameworkCore;
using PathFinder.Common.Models;

namespace TripService.Data
{
    public class TripDbContext:DbContext 
    {
        public TripDbContext(DbContextOptions<TripDbContext> options) : base(options) { }

        public DbSet<TravelPlan> TravelPlans { get; set; }
        public DbSet<Destination> Destinations { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<ChecklistItem> ChecklistItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TravelPlan>()
                .Property(t => t.PlannedBudget)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Activity>()
                .Property(a => a.EstimatedCost)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Expense>()
                .Property(e => e.Amount)
                .HasPrecision(18, 2);
        }
    }
}
