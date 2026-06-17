using Microsoft.EntityFrameworkCore;
using PathFinder.Common.Models;
using TripService.Data;
using TripService.DTOs;


namespace TripService.Services
{
    public class ChecklistService
    {
        private readonly TripDbContext _context;

        public ChecklistService(TripDbContext context)
        {
            _context = context;
        }

        public async Task<List<ChecklistItemDto>> GetAllForPlanAsync(int travelPlanId)
        {
            return await _context.ChecklistItems
                .Where(c => c.TravelPlanId == travelPlanId)
                .Select(c => ToDto(c))
                .ToListAsync();
        }

        public async Task<ChecklistItemDto?> GetByIdAsync(int id)
        {
            var item = await _context.ChecklistItems.FindAsync(id);
            return item == null ? null : ToDto(item);
        }

        public async Task<ChecklistItemDto> CreateAsync(CreateChecklistItemDto dto)
        {
            var planExists = await _context.TravelPlans.AnyAsync(p => p.Id == dto.TravelPlanId);
            if (!planExists)
                throw new ArgumentException("Plan putovanja sa datim ID-om ne postoji.");

            var item = new ChecklistItem
            {
                TravelPlanId = dto.TravelPlanId,
                Title = dto.Title,
                IsCompleted = false
            };

            _context.ChecklistItems.Add(item);
            await _context.SaveChangesAsync();

            return ToDto(item);
        }

        public async Task<ChecklistItemDto?> UpdateAsync(int id, UpdateChecklistItemDto dto)
        {
            var item = await _context.ChecklistItems.FindAsync(id);
            if (item == null) return null;

            item.Title = dto.Title;
            item.IsCompleted = dto.IsCompleted;

            await _context.SaveChangesAsync();
            return ToDto(item);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var item = await _context.ChecklistItems.FindAsync(id);
            if (item == null) return false;

            _context.ChecklistItems.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }

        private static ChecklistItemDto ToDto(ChecklistItem c)
        {
            return new ChecklistItemDto
            {
                Id = c.Id,
                TravelPlanId = c.TravelPlanId,
                Title = c.Title,
                IsCompleted = c.IsCompleted
            };
        }
    }
}
