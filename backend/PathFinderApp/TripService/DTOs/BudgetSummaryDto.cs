namespace TripService.DTOs
{
    public class BudgetSummaryDto
    {
        public decimal PlannedBudget { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal RemainingBudget { get; set; }
        public Dictionary<string, decimal> SpentByCategory { get; set; } = new();
    }
}
