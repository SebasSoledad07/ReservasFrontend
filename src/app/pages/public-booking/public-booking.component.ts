import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
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
import { ActivatedRoute } from '@angular/router';
import { PublicBookingService } from '../../services/public-booking.service';

/** Valida que la fecha no sea anterior a hoy */
export function fechaNoAnteriorValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const seleccionada = new Date(control.value + 'T00:00:00');
  return seleccionada < hoy ? { fechaPasada: true } : null;
}

/** Valida que la hora esté entre 08:00 y 21:00 */
export function horaRangoValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const [h, m] = control.value.split(':').map(Number);
  const minutos = h * 60 + m;
  if (minutos < 8 * 60) return { horaMinima: true };
  if (minutos > 21 * 60) return { horaMaxima: true };
  return null;
}

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
    date: ['', [Validators.required, fechaNoAnteriorValidator]],
    time: ['', [Validators.required, horaRangoValidator]],
    serviceName: ['', Validators.required],
  });

  /** Mínima hora permitida (08:00) */
  readonly minTime = '08:00';
  /** Máxima hora permitida (21:00) */
  readonly maxTime = '21:00';

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
      .createPublicBooking(this.slug(), {
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
        error: (message: string) => {
          this.isLoading.set(false);
          // PublicBookingService.mapHttpError ya devuelve string amigable
          this.errorMessage.set(message ?? 'No se pudo crear la reserva. Intentá de nuevo.');
        },
      });
  }

  resetForm(): void {
    this.form.reset();
    this.isSubmitted.set(false);
    this.errorMessage.set('');
  }
}