using System.ComponentModel.DataAnnotations;

namespace hse1backend.Models
{
    public class Epi
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; } 
    }
} 