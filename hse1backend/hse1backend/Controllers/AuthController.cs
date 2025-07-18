using hse1backend.Models;
using hse1backend.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System;

namespace hse1backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _authService.AuthenticateAsync(request.UsernameOrEmail, request.Password);
            if (user == null)
                return Unauthorized("Nom d'utilisateur, email ou mot de passe incorrect.");

            var token = _authService.GenerateJwtToken(user);
            var refreshToken = await _authService.CreateAndStoreRefreshTokenAsync(user);
            SetRefreshTokenCookie(refreshToken.Token, refreshToken.Expires);
            return Ok(new { token });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized("No refresh token provided.");
            var validToken = await _authService.GetValidRefreshTokenAsync(refreshToken);
            if (validToken == null)
                return Unauthorized("Invalid or expired refresh token.");
            // Sliding expiration: update last used
            await _authService.UpdateRefreshTokenLastUsedAsync(validToken);
            var newAccessToken = _authService.GenerateJwtToken(validToken.User);
            // Optionally: issue a new refresh token (rotation)
            SetRefreshTokenCookie(validToken.Token, validToken.Expires);
            return Ok(new { token = newAccessToken });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (!string.IsNullOrEmpty(refreshToken))
            {
                await _authService.RevokeRefreshTokenAsync(refreshToken);
                Response.Cookies.Delete("refreshToken");
            }
            return Ok();
        }

        private void SetRefreshTokenCookie(string token, DateTime expires)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Set to true in production (HTTPS)
                SameSite = SameSiteMode.Strict,
                Expires = expires
            };
            Response.Cookies.Append("refreshToken", token, cookieOptions);
        }

        [HttpPost("create-first-admin")]
        public async Task<IActionResult> CreateFirstAdmin([FromBody] CreateAdminRequest request)
        {
            // Vérifie s'il existe déjà un utilisateur
            if (await _authService.UserExistsAsync())
                return BadRequest("Un utilisateur existe déjà. Cette opération n'est possible que pour le tout premier admin.");

            var user = new User
            {
                Email = request.Email,
                PasswordHash = AuthService.HashPassword(request.Password),
                Role = "Admin"
            };
            await _authService.CreateUserAsync(user);
            return Ok("Premier administrateur créé avec succès.");
        }

        /// <summary>
        /// Crée un nouvel administrateur (réservé aux admins authentifiés).
        /// Utilisez le bouton "Authorize" en haut de Swagger et collez le token JWT sous la forme: Bearer VOTRE_TOKEN
        /// </summary>
        [HttpPost("create-admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminFullRequest request)
        {
            // Vérifie si l'email, le teConnectivityId ou le username existe déjà
            if (await _authService.UserExistsByEmailOrTeIdOrUsernameAsync(request.Email, request.TeConnectivityId, request.Username))
                return BadRequest("Un utilisateur avec cet email, ce teConnectivityId ou ce username existe déjà.");

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = AuthService.HashPassword(request.Password),
                Role = "Admin",
                TeConnectivityId = request.TeConnectivityId
            };
            await _authService.CreateUserAsync(user);
            return Ok("Nouvel administrateur créé avec succès.");
        }
    }

    public class LoginRequest
    {
        public string UsernameOrEmail { get; set; }
        public string Password { get; set; }
    }

    public class CreateAdminRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class CreateAdminFullRequest
    {
        public string TeConnectivityId { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
} 