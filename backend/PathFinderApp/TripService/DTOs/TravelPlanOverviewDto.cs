namespace TripService.DTOs
{
    public class TravelPlanOverviewDto
    {
        public TravelPlanDto Plan { get; set; } = null!;
        public List<DestinationWithActivitiesDto> Destinations { get; set; } = new();
        public List<ExpenseDto> Expenses { get; set; } = new();
        public BudgetSummaryDto Budget { get; set; } = null!;
        public List<ChecklistItemDto> ChecklistItems { get; set; } = new();
    }

    
}
