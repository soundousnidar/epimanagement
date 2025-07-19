import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Navbar } from '../../layout/navbar/navbar';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { EpiService, Epi as EpiModel } from '../../core/services/epi.service';
import { FilePreviewPipe } from './file-preview.pipe';

@Component({
  selector: 'app-epi',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Navbar, Sidebar, FilePreviewPipe],
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
  showEditModal = false;
  editEpiForm: FormGroup;
  editSelectedFile: File | null = null;
  editingEpiId: number | null = null;
  searchTerm: string = '';

  constructor(
    private epiService: EpiService,
    private fb: FormBuilder
  ) {
    this.epiForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['']
    });
    this.editEpiForm = this.fb.group({
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
      if (this.selectedFile) {
        imageUrl = await this.epiService.uploadImage(this.selectedFile).toPromise() || '';
      }
      const newEpi: EpiModel = {
        name: this.epiForm.value.name,
        description: this.epiForm.value.description,
        imageUrl: imageUrl
      };
      this.epiService.createEpi(newEpi).subscribe({
        next: (epi) => {
          this.closeCreateModal();
          this.loading = false;
          this.loadEpis(); // recharge la liste après création
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

  openEditModal(epi: EpiModel | null | undefined) {
    if (!epi || epi.id == null) {
      this.errorMessage = "EPI invalide pour l'édition.";
      return;
    }
    this.showEditModal = true;
    this.editingEpiId = epi.id;
    this.editEpiForm.patchValue({
      name: epi.name || '',
      description: epi.description || '',
      imageUrl: epi.imageUrl || ''
    });
    this.editSelectedFile = null;
    this.errorMessage = '';
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingEpiId = null;
    this.editEpiForm.reset();
    this.editSelectedFile = null;
    this.errorMessage = '';
  }

  onEditFileSelected(event: any) {
    this.editSelectedFile = event.target.files[0];
  }

  async onEditSubmit() {
    if (this.editEpiForm.invalid || this.editingEpiId == null) {
      this.errorMessage = 'Veuillez remplir tous les champs requis';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    try {
      let imageUrl = this.editEpiForm.value.imageUrl;
      if (this.editSelectedFile) {
        imageUrl = await this.epiService.uploadImage(this.editSelectedFile).toPromise() || imageUrl;
      }
      const updatedEpi: EpiModel = {
        id: this.editingEpiId,
        name: this.editEpiForm.value.name,
        description: this.editEpiForm.value.description,
        imageUrl: imageUrl
      };
      this.epiService.updateEpi(this.editingEpiId, updatedEpi).subscribe({
        next: (epi) => {
          this.closeEditModal();
          this.loading = false;
          this.loadEpis(); // recharge la liste après modification
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.errorMessage = 'Erreur lors de la modification de l\'EPI';
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      this.errorMessage = 'Erreur lors de l\'upload de l\'image';
      this.loading = false;
    }
  }

  removeEditImage() {
    this.editEpiForm.patchValue({ imageUrl: '' });
    this.editSelectedFile = null;
  }

  removeCreateImage() {
    this.selectedFile = null;
    this.epiForm.patchValue({ imageUrl: '' });
  }

  deleteEpi(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet EPI ?')) {
      this.epiService.deleteEpi(id).subscribe({
        next: () => {
          this.loadEpis(); // recharge la liste après suppression
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

  get filteredEpis(): EpiModel[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.epis;
    return this.epis.filter(epi =>
      (epi?.name?.toLowerCase().includes(term) || epi?.description?.toLowerCase().includes(term))
    );
  }
}
