import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PublicBookingService } from '../../services/public-booking.service';

@Component({
  selector: 'app-public-booking',
  imports: [ReactiveFormsModule],
  templateUrl: './public-booking.component.html',
  styleUrl: './public-booking.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicBookingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly publicBookingService = inject(PublicBookingService);

  readonly slug = signal('');

  /** Nombre legible derivado del slug: "mi-empresa" → "Mi Empresa" */
  readonly companyDisplayName = computed(() =>
    this.slug()
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) || 'la empresa',
  );

  readonly isLoading = signal(false);

  readonly isSubmitted = signal(false);
  readonly errorMessage = signal('');

  readonly servicios = [
    'Corte de pelo',
    'Manicura',
    'Masaje relajante',
    'Limpieza facial',
    'Coloración',
  ];

  readonly form = this.fb.group({
    clientName: ['', [Validators.required, Validators.minLength(2)]],
    date: ['', Validators.required],
    time: ['', Validators.required],
    serviceName: ['', Validators.required],
  });

  get clientNameControl() { return this.form.get('clientName')!; }
  get dateControl() { return this.form.get('date')!; }
  get timeControl() { return this.form.get('time')!; }
  get serviceControl() { return this.form.get('serviceName')!; }

  /** Mínima fecha seleccionable: hoy */
  readonly today = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    const s = this.route.snapshot.paramMap.get('slug') ?? '';
    this.slug.set(s);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { clientName, date, time, serviceName } = this.form.value;

    this.publicBookingService
      .crearReserva(this.slug(), {
        clientName: clientName!,
        date: date!,
        time: time!,
        serviceName: serviceName!,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.isSubmitted.set(true);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err?.status === 409) {
            this.errorMessage.set(
              'Ese horario ya está reservado. Elegí otro turno.',
            );
          } else if (err?.status === 404) {
            this.errorMessage.set(
              'El link de esta empresa no es válido.',
            );
          } else {
            this.errorMessage.set(
              err?.error?.message ?? 'No se pudo crear la reserva. Intentá de nuevo.',
            );
          }
        },
      });
  }

  resetForm(): void {
    this.form.reset();
    this.isSubmitted.set(false);
    this.errorMessage.set('');
  }
}