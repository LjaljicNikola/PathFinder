using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;

namespace TripService.Data
{
    public class TripDbContextFactory : IDesignTimeDbContextFactory<TripDbContext>
    {
        public TripDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<TripDbContext>();
            optionsBuilder.UseSqlServer("Server=localhost;Database=PathFinderDb;Trusted_Connection=True;TrustServerCertificate=True;");
            return new TripDbContext(optionsBuilder.Options);
        }
    }
}
