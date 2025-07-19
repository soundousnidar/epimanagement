import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Navbar } from '../../layout/navbar/navbar';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { EpiService, Epi as EpiModel } from '../../core/services/epi.service';

@Component({
  selector: 'app-epi',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar, Sidebar],
  templateUrl: './epi.html',
  styleUrl: './epi.css'
})
export class Epi implements OnInit {
  epis: EpiModel[] = [];
  showCreateModal = false;
  epiForm: FormGroup;
  selectedFile: File | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private epiService: EpiService,
    private fb: FormBuilder
  ) {
    this.epiForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['']
    });
  }

  ngOnInit() {
    this.loadEpis();
  }

  loadEpis() {
    this.loading = true;
    this.epiService.getAllEpis().subscribe({
      next: (epis) => {
        this.epis = epis;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des EPI:', error);
        this.errorMessage = 'Erreur lors du chargement des EPI';
        this.loading = false;
      }
    });
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.epiForm.reset();
    this.selectedFile = null;
    this.errorMessage = '';
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.epiForm.reset();
    this.selectedFile = null;
    this.errorMessage = '';
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async onSubmit() {
    if (this.epiForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs requis';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      let imageUrl = '';
      
      // Upload image si sélectionnée
      if (this.selectedFile) {
        imageUrl = await this.epiService.uploadImage(this.selectedFile).toPromise() || '';
      }

      // Créer l'EPI
      const newEpi: EpiModel = {
        name: this.epiForm.value.name,
        description: this.epiForm.value.description,
        imageUrl: imageUrl
      };

      this.epiService.createEpi(newEpi).subscribe({
        next: (epi) => {
          this.epis.push(epi);
          this.closeCreateModal();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.errorMessage = 'Erreur lors de la création de l\'EPI';
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      this.errorMessage = 'Erreur lors de l\'upload de l\'image';
      this.loading = false;
    }
  }

  deleteEpi(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet EPI ?')) {
      this.epiService.deleteEpi(id).subscribe({
        next: () => {
          this.epis = this.epis.filter(epi => epi.id !== id);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.errorMessage = 'Erreur lors de la suppression';
        }
      });
    }
  }

  getImageUrl(imageUrl: string): string | null {
    // Si l'imageUrl est vide, null, ou "string", retourner null
    if (!imageUrl || imageUrl === 'string' || imageUrl.trim() === '') {
      return null;
    }
    
    // Si c'est déjà une URL complète
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Si c'est un chemin relatif, construire l'URL complète
    return `http://localhost:5250/${imageUrl}`;
  }

  onImageError(event: any) {
    // Remplacer l'image par une image par défaut ou masquer l'image
    event.target.style.display = 'none';
    const parent = event.target.parentElement;
    const noImageDiv = document.createElement('div');
    noImageDiv.className = 'no-image';
    noImageDiv.textContent = 'Image non trouvée';
    parent.appendChild(noImageDiv);
  }
}
