using hse1backend.Data;
using hse1backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace hse1backend.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<User?> AuthenticateAsync(string usernameOrEmail, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Username == usernameOrEmail ||
                u.Email == usernameOrEmail ||
                u.TeConnectivityId == usernameOrEmail);
            if (user == null) return null;
            if (!VerifyPassword(password, user.PasswordHash)) return null;
            return user;
        }

        public string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username ?? string.Empty),
                new Claim(ClaimTypes.Role, user.Role ?? string.Empty),
                new Claim("Department", user.Department ?? string.Empty),
                new Claim("CostCenter", user.CostCenter ?? string.Empty)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(8),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<bool> UserExistsAsync()
        {
            return await _context.Users.AnyAsync();
        }

        public async Task<bool> UserExistsByEmailOrUsernameAsync(string email, string username)
        {
            return await _context.Users.AnyAsync(u => u.Email == email || u.Username == username);
        }

        public async Task<bool> UserExistsByEmailOrTeIdOrUsernameAsync(string email, string teId, string username)
        {
            return await _context.Users.AnyAsync(u => u.Email == email || u.TeConnectivityId == teId || u.Username == username);
        }

        public async Task CreateUserAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        public static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        public static bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }

        // --- Refresh Token Logic ---
        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public async Task<RefreshToken> CreateAndStoreRefreshTokenAsync(User user)
        {
            var token = GenerateRefreshToken();
            var now = DateTime.UtcNow;
            var refreshToken = new RefreshToken
            {
                Token = token,
                UserId = user.Id,
                Expires = now.AddHours(2), // Absolute expiration (optional, for max session)
                LastUsed = now,
                IsRevoked = false
            };
            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();
            return refreshToken;
        }

        public async Task<RefreshToken?> GetValidRefreshTokenAsync(string token)
        {
            var now = DateTime.UtcNow;
            var refreshToken = await _context.RefreshTokens.Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == token && !r.IsRevoked);
            if (refreshToken == null) return null;
            // Sliding expiration: expires if not used for 2h
            if (refreshToken.LastUsed.AddHours(2) < now) return null;
            // Optionally: check absolute expiration
            if (refreshToken.Expires < now) return null;
            return refreshToken;
        }

        public async Task UpdateRefreshTokenLastUsedAsync(RefreshToken refreshToken)
        {
            refreshToken.LastUsed = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task RevokeRefreshTokenAsync(string token)
        {
            var refreshToken = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.Token == token);
            if (refreshToken != null)
            {
                refreshToken.IsRevoked = true;
                await _context.SaveChangesAsync();
            }
        }
    }
} 