/**
 * Utilidades para cálculo de quincenas de nómina (días 15 y último día del mes)
 */

export interface FortnightSchedulePreviewItem {
  installmentNumber: number;
  totalInstallments: number;
  cutOffDate: string; // YYYY-MM-DD
  formattedDate: string; // DD/MM/YYYY
  amount: number;
}

export function getLastDayOfMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

export function calculateFortnightDates(
  startDateStr: string | Date,
  totalInstallments: number,
): string[] {
  const parts =
    typeof startDateStr === 'string'
      ? startDateStr.split('T')[0].split('-').map(Number)
      : [
          startDateStr.getFullYear(),
          startDateStr.getMonth() + 1,
          startDateStr.getDate(),
        ];

  let year = parts[0];
  let month = parts[1] - 1; // 0-indexed
  const day = parts[2];

  let isSecondHalf = day > 15;
  const dates: string[] = [];

  for (let i = 0; i < totalInstallments; i++) {
    if (!isSecondHalf) {
      const mStr = String(month + 1).padStart(2, '0');
      dates.push(`${year}-${mStr}-15`);
      isSecondHalf = true;
    } else {
      const lastDay = getLastDayOfMonth(year, month);
      const mStr = String(month + 1).padStart(2, '0');
      dates.push(`${year}-${mStr}-${String(lastDay).padStart(2, '0')}`);
      isSecondHalf = false;
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }
  }

  return dates;
}

export function calculateFortnightSchedulePreview(
  totalAmount: number,
  totalInstallments: number,
  startDateStr: string | Date,
): FortnightSchedulePreviewItem[] {
  if (totalInstallments < 1 || totalInstallments > 24) {
    return [];
  }

  const roundedTotal = Math.max(0, Math.round(totalAmount * 100) / 100);
  if (roundedTotal === 0) return [];

  const dates = calculateFortnightDates(startDateStr, totalInstallments);
  const baseAmount = Math.floor((roundedTotal / totalInstallments) * 100) / 100;
  const totalBase = Math.round(baseAmount * totalInstallments * 100) / 100;
  const centDifference = Math.round((roundedTotal - totalBase) * 100) / 100;

  return dates.map((cutOffDate, index) => {
    const isLast = index === totalInstallments - 1;
    const amount = isLast
      ? Math.round((baseAmount + centDifference) * 100) / 100
      : baseAmount;

    const [y, m, d] = cutOffDate.split('-');
    return {
      installmentNumber: index + 1,
      totalInstallments,
      cutOffDate,
      formattedDate: `${d}/${m}/${y}`,
      amount,
    };
  });
}

/**
 * Obtiene la lista de opciones de quincenas para filtros de reporte
 * (últimas 6 quincenas y próximas 12 quincenas a partir de hoy)
 */
export function getFortnightCutOffOptions(): { value: string; label: string }[] {
  const now = new Date();
  const options: { value: string; label: string }[] = [];

  // Empezar 6 quincenas atrás (aprox 3 meses)
  const past = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const dates = calculateFortnightDates(past, 24);

  const monthsEs = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];

  for (const dateStr of dates) {
    const [y, mStr, dStr] = dateStr.split('-');
    const m = Number(mStr) - 1;
    const isMid = dStr === '15';
    const label = `${isMid ? '1ª Qna' : '2ª Qna'} ${monthsEs[m]} ${y} (${dStr}/${mStr}/${y})`;
    options.push({ value: dateStr, label });
  }

  return options;
}

/**
 * Quincena actual por defecto
 */
export function getCurrentFortnightDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const day = now.getDate();
  const mStr = String(m + 1).padStart(2, '0');

  if (day <= 15) {
    return `${y}-${mStr}-15`;
  }
  const lastDay = getLastDayOfMonth(y, m);
  return `${y}-${mStr}-${String(lastDay).padStart(2, '0')}`;
}

