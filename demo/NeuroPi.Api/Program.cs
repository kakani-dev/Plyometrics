using Microsoft.EntityFrameworkCore;
using NeuroPi.Api.Data;
using NeuroPi.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Database config (SQLite)
builder.Services.AddDbContext<AssessmentDbContext>(options =>
    options.UseSqlite("Data Source=neuropi.db"));

// Register Services
builder.Services.AddScoped<IAssessmentService, AssessmentService>();
builder.Services.AddScoped<IGeminiService, GeminiService>();
builder.Services.AddHttpClient();

// CORS configuration - Allow React development server access
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// Ensure Database is created and initialized with questions/rules
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AssessmentDbContext>();
        context.Database.EnsureCreated(); // Creates database file if it doesn't exist

        // Migrate existing DB: add columns added to the model after initial creation
        context.Database.OpenConnection();
        using (var cmd = context.Database.GetDbConnection().CreateCommand())
        {
            cmd.CommandText = "SELECT name FROM pragma_table_info('Sessions')";
            using var reader = cmd.ExecuteReader();
            var existing = new HashSet<string>();
            while (reader.Read()) existing.Add(reader.GetString(0));

            var missing = new (string name, string def)[]
            {
                ("DifficultyTypes", "TEXT NOT NULL DEFAULT 'Easy,Medium,Hard'"),
                ("DifficultyRatios", "TEXT NOT NULL DEFAULT '33,34,33'"),
                ("QuestionsPerSubdomain", "INTEGER NOT NULL DEFAULT 3"),
                ("TestTypeServiceId", "INTEGER NOT NULL DEFAULT 1"),
                ("TenantId", "INTEGER NOT NULL DEFAULT 1"),
            };

            foreach (var (name, def) in missing)
            {
                if (!existing.Contains(name))
                {
                    var alter = context.Database.GetDbConnection().CreateCommand();
                    alter.CommandText = $"ALTER TABLE \"Sessions\" ADD COLUMN \"{name}\" {def}";
                    alter.ExecuteNonQuery();
                    Console.WriteLine($"Added missing column: {name}");
                }
            }
        }
        context.Database.CloseConnection();
        
        var assessmentService = services.GetRequiredService<IAssessmentService>();
        await assessmentService.InitializeAsync();
        Console.WriteLine("Database and assessment engine initialized successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error during startup initialization: {ex.Message}");
    }
}

app.Run();
