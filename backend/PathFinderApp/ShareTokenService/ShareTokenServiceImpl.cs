using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using PathFinder.Common.DTOs;
using PathFinder.Common.Interfaces;

namespace ShareTokenService
{
    public class ShareTokenServiceImpl : IShareTokenService
    {
        private readonly IReliableStateManager _stateManager;
        private const string DictionaryName = "shareTokensStore";

        public ShareTokenServiceImpl(IReliableStateManager stateManager)
        {
            _stateManager = stateManager;
        }

        private async Task<IReliableDictionary<string, ShareTokenData>> GetDictionaryAsync()
            => await _stateManager.GetOrAddAsync<IReliableDictionary<string, ShareTokenData>>(DictionaryName);

        private static ShareTokenDto MapToDto(ShareTokenData data) => new()
        {
            Token = data.Token,
            TravelPlanId = data.TravelPlanId,
            AccessLevel = data.AccessLevel,
            ExpiredOn = data.ExpiresOn ?? DateTime.MaxValue
        };

        public async Task<string> GenerateTokenAsync(int travelPlanId, string accessLevel)
        {
            var dict = await GetDictionaryAsync();
            var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
                .Replace("/", "_").Replace("+", "-").TrimEnd('=');

            var data = new ShareTokenData
            {
                Token = token,
                TravelPlanId = travelPlanId,
                AccessLevel = accessLevel,
                CreatedOn = DateTime.UtcNow,
                ExpiresOn = DateTime.UtcNow.AddDays(30)
            };

            using var tx = _stateManager.CreateTransaction();
            await dict.AddOrUpdateAsync(tx, token, data, (k, v) => data);
            await tx.CommitAsync();

            return token;
        }

        public async Task<ShareTokenDto> CheckTokenAsync(string token)
        {
            var dict = await GetDictionaryAsync();

            using var tx = _stateManager.CreateTransaction();
            var result = await dict.TryGetValueAsync(tx, token);

            if (!result.HasValue)
                throw new KeyNotFoundException("Token nije pronađen.");

            var data = result.Value;
            if (data.ExpiresOn.HasValue && data.ExpiresOn.Value < DateTime.UtcNow)
                throw new InvalidOperationException("Token je istekao.");

            return MapToDto(data);
        }

        public async Task RevokeTokenAsync(string token)
        {
            var dict = await GetDictionaryAsync();

            using var tx = _stateManager.CreateTransaction();
            await dict.TryRemoveAsync(tx, token);
            await tx.CommitAsync();
        }

        public async Task<List<ShareTokenDto>> GetTokensByPlanAsync(int travelPlanId)
        {
            var dict = await GetDictionaryAsync();
            var results = new List<ShareTokenDto>();

            using var tx = _stateManager.CreateTransaction();
            var enumerable = await dict.CreateEnumerableAsync(tx);
            using var enumerator = enumerable.GetAsyncEnumerator();

            while (await enumerator.MoveNextAsync(CancellationToken.None))
            {
                var pair = enumerator.Current;
                if (pair.Value.TravelPlanId == travelPlanId)
                    results.Add(MapToDto(pair.Value));
            }

            return results;
        }
    }
}
