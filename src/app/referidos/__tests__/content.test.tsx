import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReferidosContent } from '../content';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/components/layout/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));
vi.mock('@/components/layout/Footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}));

describe('ReferidosContent', () => {
  it('renders the hero title', () => {
    render(<ReferidosContent />);
    expect(screen.getByText(/gana dinero/i)).toBeInTheDocument();
    expect(screen.getByText(/invitando creadores/i)).toBeInTheDocument();
  });

  it('renders the 3-step how-it-works section', () => {
    render(<ReferidosContent />);
    expect(screen.getByText('Paso 1')).toBeInTheDocument();
    expect(screen.getByText('Paso 2')).toBeInTheDocument();
    expect(screen.getByText('Paso 3')).toBeInTheDocument();
    expect(screen.getByText('Comparte tu link')).toBeInTheDocument();
    expect(screen.getByText('Tu amiga se registra')).toBeInTheDocument();
    expect(screen.getByText('Ganas comisión')).toBeInTheDocument();
  });

  it('renders earnings examples for 5, 10, and 25 referrals', () => {
    render(<ReferidosContent />);
    expect(screen.getByText('5 creadoras')).toBeInTheDocument();
    expect(screen.getByText('10 creadoras')).toBeInTheDocument();
    expect(screen.getByText('25 creadoras')).toBeInTheDocument();
  });

  it('calculates correct earnings for 10 referrals at $500k/month', () => {
    render(<ReferidosContent />);
    // 10 referrals * ($500,000 * 10% platform fee * 5% referral) = 10 * 2,500 = $25,000/month
    expect(screen.getByText('$25.000')).toBeInTheDocument();
    // 90 days = 3 months: $25,000 * 3 = $75,000
    expect(screen.getByText('$75.000')).toBeInTheDocument();
  });

  it('renders 4 benefit cards', () => {
    render(<ReferidosContent />);
    expect(screen.getByText('Sin límite de referidos')).toBeInTheDocument();
    expect(screen.getByText('Comisión automática')).toBeInTheDocument();
    expect(screen.getByText('Todos pueden participar')).toBeInTheDocument();
    expect(screen.getByText('Link personalizado')).toBeInTheDocument();
  });

  it('has CTA links to /login', () => {
    render(<ReferidosContent />);
    const links = screen.getAllByRole('link', { name: /obtener mi link de referido/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute('href', '/login');
  });

  it('mentions commission rate and duration', () => {
    render(<ReferidosContent />);
    // Check that 5% and 90 days are mentioned somewhere on the page
    expect(screen.getAllByText(/5%/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/90 días/i).length).toBeGreaterThan(0);
  });

  it('renders navbar and footer', () => {
    render(<ReferidosContent />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
