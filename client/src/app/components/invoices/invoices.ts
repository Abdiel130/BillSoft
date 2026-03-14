import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../generics/input/input.component';
import { ButtonComponent } from '../generics/button/button.component';
import { ModalComponent } from '../generics/modal/modal.component';
import { SatService, SatSearchParams } from '../../core/services/sat.service';
import { RadioButtonComponent, RadioButtonOption } from '../generics/radio-button/radio-button.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent, ModalComponent, LucideAngularModule, RadioButtonComponent],
  templateUrl: './invoices.html',
  styleUrl: './invoices.css',
})
export class Invoices {
  private fb = inject(FormBuilder);
  private satService = inject(SatService);

  invoiceTypes: RadioButtonOption[] = [
    { label: 'Emitidas', value: 'issued' },
    { label: 'Recibidas', value: 'received' }
  ];

  // Estados de UI
  isLoading = signal(false);
  isModalOpen = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Estados de Sesión SAT
  sessionId = signal<string | null>(null);
  captchaImage = signal<string | null>(null);
  
  // Temporizador Captcha (5 Minutos)
  timeLeft = signal(300);
  private timerInterval: any;

  // Formularios
  mainForm: FormGroup;
  captchaForm: FormGroup;

  formattedTime = computed(() => {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  constructor() {
    this.mainForm = this.fb.group({
      rfc: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13)]],
      ciec: ['', [Validators.required]],
      type: ['issued', []],
      fechaInicial: ['', [Validators.required]], // Binded a type="date" (YYYY-MM-DD)
      fechaFinal: ['', [Validators.required]],
    });

    this.captchaForm = this.fb.group({
      captchaText: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  getControl(name: string) {
    return this.mainForm.get(name) as any;
  }

  getCaptchaControl(name: string) {
    return this.captchaForm.get(name) as any;
  }

  // Convierte 'YYYY-MM-DD' a 'DD/MM/YYYY' para el SAT
  private formatDateForSat(dateString: string): string {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  // 1. Inicia el proceso
  startProcess() {
    if (this.mainForm.invalid) {
      this.mainForm.markAllAsTouched();
      this.errorMessage.set('Por favor, completa correctamente todos los campos obligatorios.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.satService.startSession().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.sessionId.set(res.data.sessionId);
        this.setAndCleanCaptcha(res.data.captchaImage);
        
        this.captchaForm.reset();
        this.isModalOpen.set(true);
        this.startTimer();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al conectar con el SAT.');
      }
    });
  }

  // 2. Envío del Captcha y Datos
  submitCaptcha() {
    if (this.captchaForm.invalid) return;

    const sessionId = this.sessionId();
    if (!sessionId) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const mainValues = this.mainForm.value;
    const captchaText = this.captchaForm.value.captchaText;

    const searchParams: SatSearchParams = {
      type: mainValues.type,
      fechaInicial: this.formatDateForSat(mainValues.fechaInicial),
      fechaFinal: this.formatDateForSat(mainValues.fechaFinal)
    };

    this.satService.requestInvoices(sessionId, mainValues.rfc, mainValues.ciec, captchaText, searchParams)
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.stopTimer();
          this.isModalOpen.set(false);
          this.successMessage.set(`¡Éxito! Folio generado: ${res.data.folio || 'Pendiente'}. El backend procesará la descarga.`);
        },
        error: (err) => {
          this.isLoading.set(false);
          // Si el código es 401, el Captcha fue incorrecto, actualizamos imagen.
          if (err.status === 401 && err.error?.data?.newCaptchaImage) {
            this.setAndCleanCaptcha(err.error.data.newCaptchaImage);
            this.captchaForm.reset();
            this.errorMessage.set('Captcha incorrecto. Intenta nuevamente.');
            // Opcional: reiniciar timer aquí si el SAT otorga más tiempo
          } else {
            this.stopTimer();
            this.isModalOpen.set(false);
            this.errorMessage.set(err.error?.message || 'Fallo inesperado al solicitar facturas.');
          }
        }
      });
  }

  private setAndCleanCaptcha(rawImage: string) {
    const cleaned = this.satService.cleanCaptchaImage(rawImage);
    this.captchaImage.set(cleaned);
  }

  // Lógica del Temporizador
  private startTimer() {
    this.stopTimer();
    this.timeLeft.set(300); // 5 Minutos
    
    this.timerInterval = setInterval(() => {
      if (this.timeLeft() > 0) {
        this.timeLeft.update(v => v - 1);
      } else {
        this.handleTimerExpiration();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private handleTimerExpiration() {
    this.stopTimer();
    this.isModalOpen.set(false);
    this.errorMessage.set('El tiempo para resolver el captcha ha expirado. Por favor, inicie de nuevo la solicitud.');
    this.sessionId.set(null);
  }

  closeModal() {
    this.stopTimer();
    this.isModalOpen.set(false);
    this.sessionId.set(null);
  }
}