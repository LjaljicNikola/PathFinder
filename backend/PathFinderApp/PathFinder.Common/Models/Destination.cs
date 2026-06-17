using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PathFinder.Common.Models
{
    public class Destination
    {
        public int Id { get; set; }
        public int TravelPlanId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime ArrivalDate { get; set; }
        public DateTime DepartureDate { get; set; }
        public string Notes { get; set; } = string.Empty;

        public List<Activity> Activities { get; set; } = new();
    }
}
