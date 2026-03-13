import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../generics/input/input.component';
import { ButtonComponent } from '../generics/button/button.component';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    loginForm: FormGroup;
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    // Helper method to get form controls easily in the template
    getControl(name: string) {
        return this.loginForm.get(name) as any;
    }

    onSubmit() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            this.errorMessage.set('Por favor, complete correctamente los campos obligatorios.');
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        const credentials = this.loginForm.value;

        this.authService.login(credentials.username, credentials.password).subscribe({
            next: (res) => {
                this.isLoading.set(false);
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.errorMessage.set(err.error?.message || 'Error al iniciar sesión. Inténtelo de nuevo.');
            }
        });
    }
}
