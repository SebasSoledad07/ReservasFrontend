import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

function passwordMatchValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (!password || !confirm) return null;
  return password.value === confirm.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  // Backend RegisterRequestDTO: { companyName, username, password, email }
  readonly form = this.fb.group(
    {
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  get companyNameControl() {
    return this.form.get('companyName')!;
  }

  get usernameControl() {
    return this.form.get('username')!;
  }

  get emailControl() {
    return this.form.get('email')!;
  }

  get passwordControl() {
    return this.form.get('password')!;
  }

  get confirmPasswordControl() {
    return this.form.get('confirmPassword')!;
  }

  get passwordMismatch() {
    return (
      this.form.hasError('passwordMismatch') &&
      this.confirmPasswordControl.touched
    );
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { companyName, username, email, password } = this.form.value;

    this.authService
      .register({
        companyName: companyName!,
        username: username!,
        email: email!,
        password: password!,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set(
            '¡Empresa registrada! Redirigiendo a tu panel...',
          );
          setTimeout(() => this.router.navigate(['/reservas']), 1500);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err?.error?.message ?? 'No se pudo registrar. Intenta de nuevo.',
          );
        },
      });
  }
}
