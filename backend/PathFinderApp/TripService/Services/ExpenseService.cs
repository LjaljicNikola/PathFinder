using Microsoft.EntityFrameworkCore;
using PathFinder.Common.Models;
using TripService.Data;
using TripService.DTOs;

namespace TripService.Services
{
    public class ExpenseService
    {
        private readonly TripDbContext _context;

        public ExpenseService(TripDbContext context)
        {
            _context = context;
        }

        public async Task<List<ExpenseDto>> GetAllForPlanAsync(int travelPlanId)
        {
            return await _context.Expenses
                .Where(e => e.TravelPlanId == travelPlanId)
                .Select(e => ToDto(e))
                .ToListAsync();
        }

        public async Task<ExpenseDto?> GetByIdAsync(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            return expense == null ? null : ToDto(expense);
        }

        public async Task<ExpenseDto> CreateAsync(CreateExpenseDto dto)
        {
            var plan = await _context.TravelPlans.FindAsync(dto.TravelPlanId);
            if (plan == null)
                throw new ArgumentException("Plan putovanja sa datim ID-om ne postoji.");

            if (dto.Amount < 0)
                throw new ArgumentException("Iznos troška ne može biti negativan.");

            var expense = new Expense
            {
                TravelPlanId = dto.TravelPlanId,
                Name = dto.Name,
                Category = dto.Category,
                Amount = dto.Amount,
                Date = dto.Date,
                Description = dto.Description
            };

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            return ToDto(expense);
        }

        public async Task<ExpenseDto?> UpdateAsync(int id, UpdateExpenseDto dto)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return null;

            if (dto.Amount < 0)
                throw new ArgumentException("Iznos troška ne može biti negativan.");

            expense.Name = dto.Name;
            expense.Category = dto.Category;
            expense.Amount = dto.Amount;
            expense.Date = dto.Date;
            expense.Description = dto.Description;

            await _context.SaveChangesAsync();
            return ToDto(expense);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return false;

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BudgetSummaryDto?> GetBudgetSummaryAsync(int travelPlanId)
        {
            var plan = await _context.TravelPlans.FindAsync(travelPlanId);
            if (plan == null) return null;

            var expenses = await _context.Expenses
                .Where(e => e.TravelPlanId == travelPlanId)
                .ToListAsync();

            var totalSpent = expenses.Sum(e => e.Amount);

            var byCategory = expenses
                .GroupBy(e => e.Category)
                .ToDictionary(g => g.Key, g => g.Sum(e => e.Amount));

            return new BudgetSummaryDto
            {
                PlannedBudget = plan.PlannedBudget,
                TotalSpent = totalSpent,
                RemainingBudget = plan.PlannedBudget - totalSpent,
                SpentByCategory = byCategory
            };
        }

        private static ExpenseDto ToDto(Expense e)
        {
            return new ExpenseDto
            {
                Id = e.Id,
                TravelPlanId = e.TravelPlanId,
                Name = e.Name,
                Category = e.Category,
                Amount = e.Amount,
                Date = e.Date,
                Description = e.Description
            };
        }
    }
}
