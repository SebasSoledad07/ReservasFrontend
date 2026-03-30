import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ReservaService } from '../../services/reserva.service';
import type { CrearReservaDto } from '../../models/reserva.model';
import {
  fechaNoAnteriorValidator,
  horaRangoValidator,
} from '../public-booking/public-booking.component';

@Component({
  selector: 'app-reserva-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reserva-form.component.html',
  styleUrl: './reserva-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservaFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly reservaService = inject(ReservaService);
  private readonly router = inject(Router);

  protected readonly servicios = [
    { id: 'corte-pelo', nombre: 'Corte de pelo' },
    { id: 'manicura', nombre: 'Manicura' },
    { id: 'masaje-relajante', nombre: 'Masaje relajante' },
    { id: 'limpieza-facial', nombre: 'Limpieza facial' },
    { id: 'coloracion', nombre: 'Coloración' },
  ];

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    clientName: ['', Validators.required],
    date: ['', [Validators.required, fechaNoAnteriorValidator]],
    time: ['', [Validators.required, horaRangoValidator]],
    serviceName: ['', Validators.required],
  });

  /** Mínima fecha: hoy */
  readonly today = new Date().toISOString().split('T')[0];
  readonly minTime = '08:00';
  readonly maxTime = '21:00';

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const dto: CrearReservaDto = this.form.getRawValue();

    this.reservaService.crear(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('✅ Reserva creada correctamente');
        this.form.reset();
        this.form.markAsPristine();
        // Navegar al panel después de 1.5s para que el usuario vea el mensaje
        setTimeout(() => this.router.navigate(['/reservas']), 1500);
      },
      error: (error) => {
        console.error('Error al crear la reserva', error);
        this.isSubmitting.set(false);
        if (error?.status === 409) {
          this.errorMessage.set('Ese horario ya está reservado. Elegí otro.');
        } else {
          this.errorMessage.set(
            error?.error?.message ?? 'No se pudo crear la reserva. Intentá de nuevo.',
          );
        }
      },
    });
  }

  cerrarError(): void {
    this.errorMessage.set(null);
  }
}
