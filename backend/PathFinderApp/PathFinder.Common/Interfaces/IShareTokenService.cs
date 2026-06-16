using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Remoting;
using PathFinder.Common.DTOs;

namespace PathFinder.Common.Interfaces
{
    public interface IShareTokenService: IService
    {
        Task<string> GenerateTokenAsync(int travelPlanId, string accessLevel);
        Task<ShareTokenDto> CheckTokenAsync(string token);
        Task RevokeTokenAsync(string token);
        Task<List<ShareTokenDto>> GetTokensByPlanAsync(int travelPlanId);
    }
}
