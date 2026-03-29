import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
  id          : number;
  rfc         : string;
  legalName   : string;
  zipCode     : string;
  nickname    : string | null;
  taxRegimeId : string | null;
  type        : 'CLIENT' | 'EXTERNAL';
  createdAt   : string | null;
}

export interface CompanyPayload {
  rfc         : string;
  legalName   : string;
  zipCode     : string;
  nickname?   : string | null;
  taxRegimeId?: string | null;
  type        : 'CLIENT' | 'EXTERNAL';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data   : T;
}

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private readonly base = '/api/companies';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Company[]>> {
    return this.http.get<ApiResponse<Company[]>>(this.base);
  }

  create(payload: CompanyPayload): Observable<ApiResponse<Company>> {
    return this.http.post<ApiResponse<Company>>(this.base, payload);
  }

  update(id: number, payload: Partial<CompanyPayload>): Observable<ApiResponse<Company>> {
    return this.http.put<ApiResponse<Company>>(`${this.base}/${id}`, payload);
  }

  remove(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${id}`);
  }
}
