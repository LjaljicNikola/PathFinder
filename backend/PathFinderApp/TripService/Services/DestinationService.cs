using Microsoft.EntityFrameworkCore;
using PathFinder.Common.Models;
using TripService.Data;
using TripService.DTOs;

namespace TripService.Services
{
    public class DestinationService
    {
        private readonly TripDbContext _context;

        public DestinationService(TripDbContext context)
        {
            _context = context;
        }

        public async Task<List<DestinationDto>> GetAllForPlanAsync(int travelPlanId)
        {
            return await _context.Destinations
                .Where(d => d.TravelPlanId == travelPlanId)
                .Select(d => ToDto(d))
                .ToListAsync();
        }

        public async Task<DestinationDto?> GetByIdAsync(int id)
        {
            var destination = await _context.Destinations.FindAsync(id);
            return destination == null ? null : ToDto(destination);
        }

        public async Task<DestinationDto> CreateAsync(CreateDestinationDto dto)
        {
            var planExists = await _context.TravelPlans.AnyAsync(p => p.Id == dto.TravelPlanId);
            if (!planExists)
                throw new ArgumentException("Plan putovanja sa datim ID-om ne postoji.");

            var destination = new Destination
            {
                TravelPlanId = dto.TravelPlanId,
                Name = dto.Name,
                Location = dto.Location,
                ArrivalDate = dto.ArrivalDate,
                DepartureDate = dto.DepartureDate,
                Notes = dto.Notes
            };

            _context.Destinations.Add(destination);
            await _context.SaveChangesAsync();

            return ToDto(destination);
        }

        public async Task<DestinationDto?> UpdateAsync(int id, UpdateDestinationDto dto)
        {
            var destination = await _context.Destinations.FindAsync(id);
            if (destination == null) return null;

            destination.Name = dto.Name;
            destination.Location = dto.Location;
            destination.ArrivalDate = dto.ArrivalDate;
            destination.DepartureDate = dto.DepartureDate;
            destination.Notes = dto.Notes;

            await _context.SaveChangesAsync();
            return ToDto(destination);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var destination = await _context.Destinations
                .Include(d => d.Activities)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (destination == null) return false;

            _context.Destinations.Remove(destination);
            await _context.SaveChangesAsync();
            return true;
        }

        private static DestinationDto ToDto(Destination d)
        {
            return new DestinationDto
            {
                Id = d.Id,
                TravelPlanId = d.TravelPlanId,
                Name = d.Name,
                Location = d.Location,
                ArrivalDate = d.ArrivalDate,
                DepartureDate = d.DepartureDate,
                Notes = d.Notes
            };
        }
    }
}
