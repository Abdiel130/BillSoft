import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SatSearchParams {
  type: 'issued' | 'received';
  fechaInicial: string; // dd/mm/yyyy
  fechaFinal: string;   // dd/mm/yyyy
}

export interface SatStartResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    captchaImage: string;
  };
}

export interface SatRequestResponse {
  success: boolean;
  message: string;
  data: {
    folio?: string;
    status?: string;
    newCaptchaImage?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SatService {
  private http = inject(HttpClient);
  private apiUrl = '/api/sat';

  startSession(): Observable<SatStartResponse> {
    return this.http.post<SatStartResponse>(`${this.apiUrl}/start`, {});
  }

  requestInvoices(
    sessionId: string,
    rfc: string,
    ciec: string,
    captchaText: string,
    searchParams: SatSearchParams
  ): Observable<SatRequestResponse> {
    return this.http.post<SatRequestResponse>(`${this.apiUrl}/solicitar-facturas/${sessionId}`, {
      rfc,
      ciec,
      captchaText,
      searchParams
    });
  }

  /**
   * Limpia el string del base64 en caso de que el backend envíe múltiples prefijos anidados.
   */
  cleanCaptchaImage(rawBase64: string): string {
    const matches = rawBase64.match(/data:image\/[^;]+;base64,/g);
    if (matches && matches.length > 1) {
      // Si hay más de un prefijo (ej. data:image/png;base64,data:image/jpeg;base64,...), quitamos el primero.
      return rawBase64.replace(matches[0], '');
    }
    return rawBase64;
  }
}