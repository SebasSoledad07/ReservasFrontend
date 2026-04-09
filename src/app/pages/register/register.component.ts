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
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/** E.164 — acepta + opcional, luego 8–15 dígitos */
const E164_REGEX = /^\+?[1-9]\d{7,14}$/;

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

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  // Backend RegisterRequestDTO: { companyName, slug?, username, password, email, companyWhatsappNumber }
  readonly form = this.fb.group(
    {
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      slug: ['', [Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      companyWhatsappNumber: ['', [Validators.required, Validators.pattern(E164_REGEX)]],
    },
    { validators: passwordMatchValidator },
  );

  get companyNameControl() { return this.form.get('companyName')!; }
  get slugControl() { return this.form.get('slug')!; }
  get usernameControl() { return this.form.get('username')!; }
  get emailControl() { return this.form.get('email')!; }
  get passwordControl() { return this.form.get('password')!; }
  get confirmPasswordControl() { return this.form.get('confirmPassword')!; }
  get whatsappControl() { return this.form.get('companyWhatsappNumber')!; }

  get passwordMismatch() {
    return (
      this.form.hasError('passwordMismatch') &&
      this.confirmPasswordControl.touched
    );
  }

  togglePassword(): void { this.showPassword.update((v) => !v); }
  toggleConfirmPassword(): void { this.showConfirmPassword.update((v) => !v); }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { companyName, slug, username, email, password, companyWhatsappNumber } = this.form.value;

    this.authService
      .register({
        companyName: companyName!,
        slug: slug?.trim() || undefined,
        username: username!,
        email: email!,
        password: password!,
        companyWhatsappNumber: companyWhatsappNumber!,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('¡Empresa registrada! Redirigiendo a tu panel...');
        },
        error: (message: string) => {
          this.isLoading.set(false);
          // AuthService.mapHttpError ya devuelve un string amigable
          this.errorMessage.set(message ?? 'No se pudo registrar. Intentá de nuevo.');
        },
      });
  }
}
