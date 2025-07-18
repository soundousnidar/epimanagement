using Microsoft.EntityFrameworkCore;
using hse1backend.Models;

namespace hse1backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Epi> Epis { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
    }
} 