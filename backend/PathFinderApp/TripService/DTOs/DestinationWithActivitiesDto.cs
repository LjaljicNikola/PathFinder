namespace TripService.DTOs
{
    public class DestinationWithActivitiesDto
    {
        public DestinationDto Destination { get; set; } = null!;
        public List<ActivityDto> Activities { get; set; } = new();
    }
}
