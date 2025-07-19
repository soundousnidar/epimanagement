import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  // Récupérer le token depuis localStorage
  const token = localStorage.getItem('token');
  
  // Si le token existe, l'ajouter au header Authorization
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(request);
}; 