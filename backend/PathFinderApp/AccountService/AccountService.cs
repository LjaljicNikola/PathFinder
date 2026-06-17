using AccountService.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AccountService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace AccountService
{
    /// <summary>
    /// The FabricRuntime creates an instance of this class for each service type instance.
    /// </summary>
    internal sealed class AccountService : StatelessService
    {
        public AccountService(StatelessServiceContext context)
            : base(context)
        { }

        /// <summary>
        /// Optional override to create listeners (like tcp, http) for this service instance.
        /// </summary>
        /// <returns>The collection of listeners.</returns>
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return new ServiceInstanceListener[]
            {
                new ServiceInstanceListener(serviceContext =>
                    new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, listener) =>
                    {
                        ServiceEventSource.Current.ServiceMessage(serviceContext, $"Starting Kestrel on {url}");

                        var builder = WebApplication.CreateBuilder();

                        builder.Services.AddSingleton<StatelessServiceContext>(serviceContext);
                        builder.WebHost
                                    .UseKestrel()
                                    .UseContentRoot(Directory.GetCurrentDirectory())
                                    .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                                    .UseUrls(url);
                        builder.Services.AddControllers();
                        builder.Services.AddEndpointsApiExplorer();
                        builder.Services.AddSwaggerGen();
                        builder.Services.AddDbContext<AppDbContext>(options =>
                        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
                        builder.Services.AddScoped<JwtTokenGenerator>();
                        builder.Services.AddScoped<AccountAuthService>();
                        var jwtSecret = builder.Configuration["Jwt:Secret"]!;
                        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                            .AddJwtBearer(options =>
                            {
                                options.TokenValidationParameters = new TokenValidationParameters
                                {
                                    ValidateIssuer = true,
                                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                                    ValidateAudience = true,
                                    ValidAudience = builder.Configuration["Jwt:Audience"],
                                    ValidateLifetime = true,
                                    ValidateIssuerSigningKey = true,
                                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
                                };
                            });
                        builder.Services.AddAuthorization();
                        var app = builder.Build();
                        if (app.Environment.IsDevelopment())
                        {
                        app.UseSwagger();
                        app.UseSwaggerUI();
                        }
                        app.UseAuthentication();
                        app.UseAuthorization();
                        app.MapControllers();
                        
                        return app;

                    }))
            };
        }
    }
}
