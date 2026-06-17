using Microsoft.EntityFrameworkCore;
using PathFinder.Common.Models;
using TripService.Data;
using TripService.DTOs;

namespace TripService.Services
{
    public class TravelPlanService
    {
        private readonly TripDbContext _context;
        private readonly ExpenseService _expenseService;
        private readonly ChecklistService _checklistService;

        public TravelPlanService(TripDbContext context, ExpenseService expenseService, ChecklistService checklistService)
        {
            _context = context;
            _expenseService = expenseService;
            _checklistService = checklistService;
        }

        public async Task<List<TravelPlanDto>> GetAllForUserAsync(int userId)
        {
            return await _context.TravelPlans
                .Where(p => p.UserId == userId)
                .Select(p => ToDto(p))
                .ToListAsync();
        }

        public async Task<TravelPlanDto?> GetByIdAsync(int id)
        {
            var plan = await _context.TravelPlans.FindAsync(id);
            return plan == null ? null : ToDto(plan);
        }

        public async Task<TravelPlanDto> CreateAsync(CreateTravelPlanDto dto)
        {
            ValidateDates(dto.StartDate, dto.EndDate);
            ValidateBudget(dto.PlannedBudget);

            var plan = new TravelPlan
            {
                UserId = dto.UserId,
                Title = dto.Title,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                PlannedBudget = dto.PlannedBudget,
                Notes = dto.Notes,
                CreatedOn = DateTime.UtcNow
            };

            _context.TravelPlans.Add(plan);
            await _context.SaveChangesAsync();

            return ToDto(plan);
        }

        public async Task<TravelPlanDto?> UpdateAsync(int id, UpdateTravelPlanDto dto)
        {
            var plan = await _context.TravelPlans.FindAsync(id);
            if (plan == null) return null;

            ValidateDates(dto.StartDate, dto.EndDate);
            ValidateBudget(dto.PlannedBudget);

            plan.Title = dto.Title;
            plan.Description = dto.Description;
            plan.StartDate = dto.StartDate;
            plan.EndDate = dto.EndDate;
            plan.PlannedBudget = dto.PlannedBudget;
            plan.Notes = dto.Notes;

            await _context.SaveChangesAsync();
            return ToDto(plan);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var plan = await _context.TravelPlans
                .Include(p => p.Destinations).ThenInclude(d => d.Activities)
                .Include(p => p.Expenses)
                .Include(p => p.ChecklistItems)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (plan == null) return false;

            _context.TravelPlans.Remove(plan);
            await _context.SaveChangesAsync();
            return true;
        }

        private static void ValidateDates(DateTime start, DateTime end)
        {
            if (end < start)
                throw new ArgumentException("Krajnji datum ne može biti prije početnog datuma.");
        }

        private static void ValidateBudget(decimal budget)
        {
            if (budget < 0)
                throw new ArgumentException("Budžet ne može imati negativnu vrijednost.");
        }

        private static TravelPlanDto ToDto(TravelPlan plan)
        {
            return new TravelPlanDto
            {
                Id = plan.Id,
                UserId = plan.UserId,
                Title = plan.Title,
                Description = plan.Description,
                StartDate = plan.StartDate,
                EndDate = plan.EndDate,
                PlannedBudget = plan.PlannedBudget,
                Notes = plan.Notes,
                CreatedOn = plan.CreatedOn
            };
        }
        public async Task<TravelPlanOverviewDto?> GetOverviewAsync(int travelPlanId)
        {
            var plan = await _context.TravelPlans
                .Include(p => p.Destinations).ThenInclude(d => d.Activities)
                .FirstOrDefaultAsync(p => p.Id == travelPlanId);

            if (plan == null) return null;

            var budget = await _expenseService.GetBudgetSummaryAsync(travelPlanId);
            var checklist = await _checklistService.GetAllForPlanAsync(travelPlanId);

            return new TravelPlanOverviewDto
            {
                Plan = ToDto(plan),
                Destinations = plan.Destinations.Select(d => new DestinationWithActivitiesDto
                {
                    Destination = new DestinationDto
                    {
                        Id = d.Id,
                        TravelPlanId = d.TravelPlanId,
                        Name = d.Name,
                        Location = d.Location,
                        ArrivalDate = d.ArrivalDate,
                        DepartureDate = d.DepartureDate,
                        Notes = d.Notes
                    },
                    Activities = d.Activities.Select(a => new ActivityDto
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
                    }).ToList()
                }).ToList(),
                Expenses = await _expenseService.GetAllForPlanAsync(travelPlanId),
                Budget = budget!,
                ChecklistItems = checklist
            };
        }
    }
}
