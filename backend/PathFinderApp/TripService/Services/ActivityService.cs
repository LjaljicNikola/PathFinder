using Microsoft.EntityFrameworkCore;
using PathFinder.Common.Models;
using TripService.Data;
using TripService.DTOs;

namespace TripService.Services
{
    public class ActivityService
    {
        private static readonly string[] ValidStatuses = { "Planned", "Booked", "Completed", "Cancelled" };

        private readonly TripDbContext _context;

        public ActivityService(TripDbContext context)
        {
            _context = context;
        }

        public async Task<List<ActivityDto>> GetAllForDestinationAsync(int destinationId)
        {
            return await _context.Activities
                .Where(a => a.DestinationId == destinationId)
                .Select(a => ToDto(a))
                .ToListAsync();
        }

        public async Task<List<ActivityDto>> GetByDateAsync(int travelPlanId, DateTime date)
        {
            return await _context.Activities
                .Where(a => a.Destination.TravelPlanId == travelPlanId && a.Date.Date == date.Date)
                .Select(a => ToDto(a))
                .ToListAsync();
        }

        public async Task<ActivityDto?> GetByIdAsync(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            return activity == null ? null : ToDto(activity);
        }

        public async Task<ActivityDto> CreateAsync(CreateActivityDto dto)
        {
            var destinationExists = await _context.Destinations.AnyAsync(d => d.Id == dto.DestinationId);
            if (!destinationExists)
                throw new ArgumentException("Destinacija sa datim ID-om ne postoji.");

            ValidateStatus(dto.Status);

            var activity = new Activity
            {
                DestinationId = dto.DestinationId,
                Name = dto.Name,
                Date = dto.Date,
                Time = dto.Time,
                Location = dto.Location,
                Description = dto.Description,
                EstimatedCost = dto.EstimatedCost,
                Status = dto.Status
            };

            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();

            return ToDto(activity);
        }

        public async Task<ActivityDto?> UpdateAsync(int id, UpdateActivityDto dto)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null) return null;

            ValidateStatus(dto.Status);

            activity.Name = dto.Name;
            activity.Date = dto.Date;
            activity.Time = dto.Time;
            activity.Location = dto.Location;
            activity.Description = dto.Description;
            activity.EstimatedCost = dto.EstimatedCost;
            activity.Status = dto.Status;

            await _context.SaveChangesAsync();
            return ToDto(activity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null) return false;

            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static void ValidateStatus(string status)
        {
            if (!ValidStatuses.Contains(status))
                throw new ArgumentException($"Status mora biti jedan od: {string.Join(", ", ValidStatuses)}.");
        }

        private static ActivityDto ToDto(Activity a)
        {
            return new ActivityDto
            {
                Id = a.Id,
                DestinationId = a.DestinationId,
                Name = a.Name,
                Date = a.Date,
                Time = a.Time,
                Location = a.Location,
                Description = a.Description,
                EstimatedCost = a.EstimatedCost,
                Status = a.Status
            };
        }
    }
}
