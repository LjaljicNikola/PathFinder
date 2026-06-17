using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using PathFinder.Common.DTOs;
using PathFinder.Common.Interfaces;

namespace TripService.Services
{
    public class SharingProxyService
    {
        private readonly IShareTokenService _shareTokenClient;

        public SharingProxyService()
        {
            var serviceUri = new Uri("fabric:/PathFinderApp/ShareTokenService");
            _shareTokenClient = ServiceProxy.Create<IShareTokenService>(serviceUri, new ServicePartitionKey(0));
        }

        public Task<string> GenerateTokenAsync(int travelPlanId, string accessLevel)
            => _shareTokenClient.GenerateTokenAsync(travelPlanId, accessLevel);

        public Task<ShareTokenDto> CheckTokenAsync(string token)
            => _shareTokenClient.CheckTokenAsync(token);

        public Task RevokeTokenAsync(string token)
            => _shareTokenClient.RevokeTokenAsync(token);

        public Task<List<ShareTokenDto>> GetTokensByPlanAsync(int travelPlanId)
            => _shareTokenClient.GetTokensByPlanAsync(travelPlanId);
    }
}
