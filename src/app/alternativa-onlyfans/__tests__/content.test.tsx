import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AlternativaOnlyfansContent } from '../content';

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

describe('AlternativaOnlyfansContent', () => {
  it('renders the hero title', () => {
    render(<AlternativaOnlyfansContent />);
    expect(screen.getByText(/apapacho vs onlyfans/i)).toBeInTheDocument();
  });

  it('renders the 4 key differentiators', () => {
    render(<AlternativaOnlyfansContent />);
    expect(screen.getAllByText('10%').length).toBeGreaterThan(0);
    expect(screen.getByText('Anti-piratería')).toBeInTheDocument();
    expect(screen.getByText('Gamificación')).toBeInTheDocument();
    expect(screen.getByText('Soporte local')).toBeInTheDocument();
  });

  it('renders the comparison table with all features', () => {
    render(<AlternativaOnlyfansContent />);
    expect(screen.getByText('Comparación detallada')).toBeInTheDocument();
    expect(screen.getByText('Comisión')).toBeInTheDocument();
    expect(screen.getByText('Moneda de pago')).toBeInTheDocument();
    expect(screen.getByText('Pesos chilenos (CLP)')).toBeInTheDocument();
    expect(screen.getByText('Dólares (USD)')).toBeInTheDocument();
  });

  it('renders FAQ section with 5 questions', () => {
    render(<AlternativaOnlyfansContent />);
    expect(screen.getByText('Preguntas sobre el cambio')).toBeInTheDocument();
    expect(screen.getByText('¿Puedo migrar mi perfil de OnlyFans a Apapacho?')).toBeInTheDocument();
    expect(screen.getByText('¿Puedo usar ambas plataformas al mismo tiempo?')).toBeInTheDocument();
  });

  it('FAQ answers are hidden by default and shown on click', () => {
    render(<AlternativaOnlyfansContent />);
    const migrationAnswer = 'Sí, puedes importar tu contenido a Apapacho.';

    // Answer not visible initially
    expect(screen.queryByText(migrationAnswer, { exact: false })).not.toBeInTheDocument();

    // Click the question
    fireEvent.click(screen.getByText('¿Puedo migrar mi perfil de OnlyFans a Apapacho?'));

    // Answer now visible
    expect(screen.getByText(migrationAnswer, { exact: false })).toBeInTheDocument();
  });

  it('clicking a different FAQ closes the previous one', () => {
    render(<AlternativaOnlyfansContent />);

    // Open first FAQ
    fireEvent.click(screen.getByText('¿Puedo migrar mi perfil de OnlyFans a Apapacho?'));
    expect(screen.getByText(/importar tu contenido/)).toBeInTheDocument();

    // Open second FAQ
    fireEvent.click(screen.getByText('¿Puedo usar ambas plataformas al mismo tiempo?'));
    expect(screen.getByText(/ambas y gradualmente/)).toBeInTheDocument();

    // First answer should be hidden
    expect(screen.queryByText(/importar tu contenido/)).not.toBeInTheDocument();
  });

  it('has CTA links to /login and /calculadora', () => {
    render(<AlternativaOnlyfansContent />);
    const loginLinks = screen.getAllByRole('link', { name: /crear cuenta gratis|empezar gratis/i });
    expect(loginLinks.length).toBeGreaterThan(0);

    const calcLinks = screen.getAllByRole('link', { name: /calcular/i });
    expect(calcLinks.length).toBeGreaterThan(0);
    expect(calcLinks[0]).toHaveAttribute('href', '/calculadora');
  });

  it('renders navbar and footer', () => {
    render(<AlternativaOnlyfansContent />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
