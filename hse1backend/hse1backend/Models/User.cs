using System.ComponentModel.DataAnnotations;

namespace hse1backend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        public string? Username { get; set; }

        [Required]
        public string PasswordHash { get; set; } // Mot de passe hashé

        [Required]
        public string Email { get; set; } // Email de l'utilisateur

        [Required]
        public string Role { get; set; } // "Admin" ou "Responsable"

        public string? Department { get; set; } // Si Responsable

        public string? CostCenter { get; set; }  // Si Responsable

        public string? TeConnectivityId { get; set; } // Identifiant TE unique
    }
}
