using TripService.Services;

namespace TripService.Middleware
{
    public class ShareTokenMiddleware
    {
        private readonly RequestDelegate _next;

        public ShareTokenMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, SharingProxyService sharingProxy)
        {
            if (context.Request.Headers.TryGetValue("X-Share-Token", out var tokenValue))
            {
                var token = tokenValue.ToString();

                try
                {
                    var shareData = await sharingProxy.CheckTokenAsync(token);

                    var isWriteRequest = context.Request.Method is "POST" or "PUT" or "DELETE";
                    if (isWriteRequest && shareData.AccessLevel != "Edit")
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        await context.Response.WriteAsJsonAsync(new { message = "Token dozvoljava samo pregled (VIEW), ne izmjene." });
                        return;
                    }

                    context.Items["SharedTravelPlanId"] = shareData.TravelPlanId;
                    context.Items["ShareAccessLevel"] = shareData.AccessLevel;
                }
                catch (KeyNotFoundException)
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { message = "Nevažeći share token." });
                    return;
                }
                catch (InvalidOperationException ex)
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { message = ex.Message });
                    return;
                }
            }

            await _next(context);
        }
    }
}
