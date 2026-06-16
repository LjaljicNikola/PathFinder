using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace PathFinder.Common.DTOs
{
    public class ShareTokenDto
    {
        public string Token { get; set; } = string.Empty;
        public int TravelPlanId { get; set; }
        public string AccessLevel { get; set; } = string.Empty;
        public DateTime ExpiredOn { get; set; }

    }
}
