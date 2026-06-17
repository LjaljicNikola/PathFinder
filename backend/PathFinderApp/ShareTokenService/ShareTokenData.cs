namespace ShareTokenService
{
    [Serializable]
    public class ShareTokenData
    {
        public string Token { get; set; } = string.Empty;
        public int TravelPlanId { get; set; }
        public string AccessLevel { get; set; } = string.Empty; // "View" ili "Edit"
        public DateTime CreatedOn { get; set; }
        public DateTime? ExpiresOn { get; set; }
    }
}
