using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PathFinder.Common.Models
{
    public class Activity
    {
        public int Id { get; set; }
        public int DestinationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public TimeSpan Time { get; set; }
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal EstimatedCost { get; set; }
        public string Status { get; set; } = "Planned";
        public Destination? Destination { get; set; }
    }
}
