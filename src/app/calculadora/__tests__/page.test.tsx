import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CalculadoraPage from '../page';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock layout components
vi.mock('@/components/layout/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));
vi.mock('@/components/layout/Footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}));

describe('CalculadoraPage', () => {
  it('renders the page title', () => {
    render(<CalculadoraPage />);
    expect(screen.getByText(/calculadora de/i)).toBeInTheDocument();
    expect(screen.getByText(/ingresos/i)).toBeInTheDocument();
  });

  it('renders the comparison sections (OnlyFans vs Apapacho)', () => {
    render(<CalculadoraPage />);
    expect(screen.getByText('OnlyFans')).toBeInTheDocument();
    expect(screen.getByText('Apapacho')).toBeInTheDocument();
  });

  it('shows default income of $500,000', () => {
    render(<CalculadoraPage />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(500000);
  });

  it('calculates correct net for default $500,000', () => {
    render(<CalculadoraPage />);
    // Apapacho: 500000 * 0.90 = 450,000
    // OnlyFans: 500000 * 0.80 * 0.97 = 388,000
    // Diff: ~62,000/mes
    expect(screen.getByText('$450.000')).toBeInTheDocument();
  });

  it('updates calculations when income changes', () => {
    render(<CalculadoraPage />);
    const input = screen.getByRole('spinbutton');

    fireEvent.change(input, { target: { value: '1000000' } });

    // Apapacho: 1,000,000 * 0.90 = 900,000
    expect(screen.getByText('$900.000')).toBeInTheDocument();
  });

  it('shows monthly and yearly savings', () => {
    render(<CalculadoraPage />);
    // Should show /mes and /año savings
    expect(screen.getByText(/\/mes/)).toBeInTheDocument();
    expect(screen.getByText(/al año/)).toBeInTheDocument();
  });

  it('renders the "why you earn more" section', () => {
    render(<CalculadoraPage />);
    expect(screen.getByText('Menor comisión')).toBeInTheDocument();
    expect(screen.getByText('Pago en pesos chilenos')).toBeInTheDocument();
    expect(screen.getByText('Pagos semanales')).toBeInTheDocument();
  });

  it('has CTA links to /login and /pricing', () => {
    render(<CalculadoraPage />);
    const loginLinks = screen.getAllByRole('link', { name: /crear cuenta gratis/i });
    expect(loginLinks.length).toBeGreaterThan(0);
    expect(loginLinks[0]).toHaveAttribute('href', '/login');

    const pricingLink = screen.getByRole('link', { name: /ver tarifas/i });
    expect(pricingLink).toHaveAttribute('href', '/pricing');
  });

  it('does not allow negative income', () => {
    render(<CalculadoraPage />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '-100000' } });
    // Should stay at previous value since negative is rejected
    expect(input).toHaveValue(500000);
  });

  it('renders navbar and footer', () => {
    render(<CalculadoraPage />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
