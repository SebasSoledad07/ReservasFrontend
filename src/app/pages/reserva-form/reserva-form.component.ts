import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { ReservaService } from '../../services/reserva.service';
import type { CrearReservaDto } from '../../models/reserva.model';
import { RouterLink } from '@angular/router';

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

  protected readonly servicios = [
    { id: 'corte-pelo', nombre: 'Corte de pelo' },
    { id: 'manicura', nombre: 'Manicura' },
    { id: 'masaje-relajante', nombre: 'Masaje relajante' },
    { id: 'limpieza-facial', nombre: 'Limpieza facial' },
    { id: 'coloracion', nombre: 'Coloración' },
  ];

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    clientName: ['', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required],
    serviceName: ['', Validators.required],
  });

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const dto: CrearReservaDto = this.form.getRawValue();

    this.reservaService.crear(dto).subscribe({
      next: () => {
        this.form.reset();
        this.form.markAsPristine();
      },
      error: (error) => {
        console.error('Error al crear la reserva', error);
        this.errorMessage.set('No se pudo crear la reserva. Inténtalo de nuevo.');
      },
      complete: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  cerrarError(): void {
    this.errorMessage.set(null);
  }
}
