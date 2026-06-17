using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using PathFinder.Common.DTOs;
using PathFinder.Common.Interfaces;
using System.Fabric;

namespace ShareTokenService
{
    internal sealed class ShareTokenService : StatefulService, IShareTokenService
    {
        private readonly ShareTokenServiceImpl _impl;

        public ShareTokenService(StatefulServiceContext context) : base(context)
        {
            _impl = new ShareTokenServiceImpl(StateManager);
        }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
            => this.CreateServiceRemotingReplicaListeners();

        public Task<string> GenerateTokenAsync(int travelPlanId, string accessLevel)
            => _impl.GenerateTokenAsync(travelPlanId, accessLevel);

        public Task<ShareTokenDto> CheckTokenAsync(string token)
            => _impl.CheckTokenAsync(token);

        public Task RevokeTokenAsync(string token)
            => _impl.RevokeTokenAsync(token);

        public Task<List<ShareTokenDto>> GetTokensByPlanAsync(int travelPlanId)
            => _impl.GetTokensByPlanAsync(travelPlanId);

        protected override Task RunAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}