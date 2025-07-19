import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Epi {
  id?: number;
  name: string;
  description: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class EpiService {
  private apiUrl = 'http://localhost:5250/api/epi';

  constructor(private http: HttpClient) {}

  // Récupérer tous les EPI
  getAllEpis(): Observable<Epi[]> {
    return this.http.get<Epi[]>(this.apiUrl);
  }

  // Récupérer un EPI par ID
  getEpiById(id: number): Observable<Epi> {
    return this.http.get<Epi>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouvel EPI
  createEpi(epi: Epi): Observable<Epi> {
    return this.http.post<Epi>(this.apiUrl, epi);
  }

  // Modifier un EPI
  updateEpi(id: number, epi: Epi): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, epi);
  }

  // Supprimer un EPI
  deleteEpi(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Upload d'image
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Utiliser responseType: 'text' pour recevoir une chaîne au lieu de JSON
    return this.http.post(`${this.apiUrl}/upload-image`, formData, {
      responseType: 'text'
    });
  }
} 