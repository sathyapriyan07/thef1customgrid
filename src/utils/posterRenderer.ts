import { CustomLineup, Team, Driver } from '../types';

export interface PosterOptions {
  title: string;
  subtitle: string;
  creatorCredit: string;
  preset: 'official' | 'dark' | 'minimal' | 'championship';
  aspectRatio: '1080x1350' | '1920x1080' | '1400x1980';
  showBranding: boolean;
  showDate: boolean;
}

// Helper to safely load image without tainting canvas
function loadImageSafely(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback: resolve null so canvas doesn't crash
      resolve(null);
    };
    img.src = src;
  });
}

export async function renderGridPoster(
  canvas: HTMLCanvasElement,
  lineup: CustomLineup,
  teams: Team[],
  drivers: Driver[],
  options: PosterOptions
): Promise<string> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Parse dimensions
  let width = 1080;
  let height = 1350;

  if (options.aspectRatio === '1920x1080') {
    width = 1920;
    height = 1080;
  } else if (options.aspectRatio === '1400x1980') {
    width = 1400;
    height = 1980;
  }

  canvas.width = width;
  canvas.height = height;

  const isDark = options.preset === 'dark';
  const isMinimal = options.preset === 'minimal';
  const isChampionship = options.preset === 'championship';

  // 1. Draw Background
  if (isMinimal) {
    ctx.fillStyle = '#0f1013';
    ctx.fillRect(0, 0, width, height);
  } else if (isDark) {
    ctx.fillStyle = '#08080a';
    ctx.fillRect(0, 0, width, height);
    // Dark carbon mesh dots
    ctx.fillStyle = '#141418';
    for (let x = 0; x < width; x += 16) {
      for (let y = 0; y < height; y += 16) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  } else if (isChampionship) {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#120204');
    grad.addColorStop(0.4, '#0e0e12');
    grad.addColorStop(1, '#08080a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Diagonal motorsport racing stripes top right
    ctx.strokeStyle = 'rgba(225, 6, 0, 0.15)';
    ctx.lineWidth = 14;
    for (let i = -height; i < width * 2; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }
  } else {
    // Official Grid Style
    ctx.fillStyle = '#0d0e12';
    ctx.fillRect(0, 0, width, height);

    // Subtle checkered band along the bottom
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    const size = 20;
    for (let x = 0; x < width; x += size * 2) {
      for (let y = height - 40; y < height; y += size) {
        ctx.fillRect(x + ((y / size) % 2) * size, y, size, size);
      }
    }
  }

  // Top Red Racing Accent Bar
  ctx.fillStyle = '#E10600';
  ctx.fillRect(0, 0, width, 8);

  // 2. Header Section
  const padX = width * 0.06;
  const headerY = 70;

  // FIA / F1 Grid Builder Badge
  ctx.fillStyle = '#E10600';
  ctx.fillRect(padX, headerY, 44, 44);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'italic 900 24px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('F1', padX + 22, headerY + 22);

  // Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 48px Montserrat, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(options.title.toUpperCase(), padX + 58, headerY - 4);

  // Subtitle & Metadata
  ctx.fillStyle = '#9ca3af';
  ctx.font = '600 18px Montserrat, sans-serif';
  const subtitleText = `${options.subtitle || 'OFFICIAL LINEUP SPECIFICATION'} • ${lineup.team_count} CONSTRUCTORS • 2025/2026`;
  ctx.fillText(subtitleText.toUpperCase(), padX + 60, headerY + 44);

  // Date on top right if enabled
  if (options.showDate) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '600 14px Montserrat, sans-serif';
    ctx.textAlign = 'right';
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    ctx.fillText(`ISSUED: ${dateStr.toUpperCase()}`, width - padX, headerY + 10);
  }

  // Horizontal divider
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padX, headerY + 80);
  ctx.lineTo(width - padX, headerY + 80);
  ctx.stroke();

  // 3. Grid of Teams & Drivers
  const contentStartY = headerY + 100;
  const contentHeight = height - contentStartY - 70;
  const totalTeams = lineup.teams.length;

  // Choose column count based on aspect ratio and total teams
  const cols = options.aspectRatio === '1920x1080' ? (totalTeams > 10 ? 4 : 5) : (width > 1200 ? 3 : 2);
  const rows = Math.ceil(totalTeams / cols);

  const colGap = 20;
  const rowGap = 16;
  const gridWidth = width - padX * 2;
  const cardWidth = (gridWidth - (cols - 1) * colGap) / cols;
  const cardHeight = (contentHeight - (rows - 1) * rowGap) / rows;

  // Render each team card
  for (let i = 0; i < lineup.teams.length; i++) {
    const slot = lineup.teams[i];
    const team = teams.find(t => t.id === slot.team_id);
    const teamName = slot.custom_team_name || team?.name || `Team ${i + 1}`;
    const primaryColor = slot.custom_primary_color || team?.primary_color || '#E10600';

    const colIndex = i % cols;
    const rowIndex = Math.floor(i / cols);

    const x = padX + colIndex * (cardWidth + colGap);
    const y = contentStartY + rowIndex * (cardHeight + rowGap);

    // Card background
    ctx.fillStyle = '#14151a';
    ctx.fillRect(x, y, cardWidth, cardHeight);

    // Card border
    ctx.strokeStyle = '#22232a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, cardWidth, cardHeight);

    // Left Team Color Accent Bar
    ctx.fillStyle = primaryColor;
    ctx.fillRect(x, y, 6, cardHeight);

    // Team Position Pill
    ctx.fillStyle = '#1c1d24';
    ctx.fillRect(x + 14, y + 10, 24, 20);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '700 12px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${slot.position || i + 1}`, x + 26, y + 20);

    // Team Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 16px Montserrat, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const truncatedTeamName = teamName.length > 22 ? teamName.substring(0, 20) + '..' : teamName;
    ctx.fillText(truncatedTeamName.toUpperCase(), x + 44, y + 20);

    // Driver Seats (Driver 1 & Driver 2)
    const seatsAreaY = y + 36;
    const seatHeight = (cardHeight - 44) / 2;

    for (let s = 1; s <= 2; s++) {
      const seat = slot.seats?.find(st => st.seat_number === s);
      const driver = drivers.find(d => d.id === seat?.driver_id);
      const seatY = seatsAreaY + (s - 1) * seatHeight;

      // Inner seat background
      ctx.fillStyle = s % 2 === 0 ? '#181920' : '#16171d';
      ctx.fillRect(x + 10, seatY, cardWidth - 20, seatHeight - 4);

      // Seat number tag
      ctx.fillStyle = '#4b5563';
      ctx.font = '700 10px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`P${s}`, x + 16, seatY + seatHeight / 2 - 2);

      if (driver) {
        // Driver 3-letter code badge
        ctx.fillStyle = primaryColor;
        ctx.fillRect(x + 36, seatY + 4, 34, seatHeight - 12);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 12px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(driver.code, x + 53, seatY + seatHeight / 2 - 2);

        // Driver Full Name
        ctx.fillStyle = '#f3f4f6';
        ctx.font = '700 13px Montserrat, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const driverNameTrunc = driver.name.length > 17 ? driver.name.substring(0, 16) + '..' : driver.name;
        ctx.fillText(driverNameTrunc, x + 76, seatY + seatHeight / 2 - 2);

        // Nationality
        ctx.fillStyle = '#6b7280';
        ctx.font = '500 10px Montserrat, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(driver.nationality, x + cardWidth - 18, seatY + seatHeight / 2 - 2);
      } else {
        // Unassigned seat
        ctx.fillStyle = '#6b7280';
        ctx.font = 'italic 12px Montserrat, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('Unassigned Seat', x + 40, seatY + seatHeight / 2 - 2);
      }
    }
  }

  // 4. Footer Branding & Credit
  const footerY = height - 36;

  if (options.showBranding) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '700 12px Montserrat, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('F1 DRIVER GRID BUILDER • PADDOCK MOTORSPORT ARCHIVE', padX, footerY);
  }

  if (options.creatorCredit) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '600 12px Montserrat, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`CURATED BY ${options.creatorCredit.toUpperCase()}`, width - padX, footerY);
  }

  return canvas.toDataURL('image/png');
}
