namespace TripService.DTOs
{
    public class UpdateTravelPlanDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal PlannedBudget { get; set; }
        public string Notes { get; set; } = string.Empty;
    }
}
