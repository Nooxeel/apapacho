/**
 * Tests: GatewaySelector component
 *
 * Smoke tests para el selector de gateway de pago.
 * Verifica render condicional del botón Flow según NEXT_PUBLIC_FLOW_ENABLED.
 *
 * AC-1 (Task 7): Given el flag activo, When se renderiza GatewaySelector,
 *   Then aparece el botón Flow; con flag inactivo, no aparece.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// --- Mock factories ----------------------------------------------------------

/**
 * Factory: props mínimas para GatewaySelector
 */
function createGatewaySelectorProps(overrides: Partial<{
  selected: 'webpay' | 'mercadopago' | 'fintoc' | 'flow';
  onChange: (gateway: 'webpay' | 'mercadopago' | 'fintoc' | 'flow') => void;
}> = {}) {
  return {
    selected: 'webpay' as const,
    onChange: vi.fn(),
    ...overrides,
  };
}

// --- Helpers -----------------------------------------------------------------

/**
 * Importa GatewaySelector de forma limpia después de configurar el env var.
 * Necesario porque el flag se evalúa en tiempo de módulo.
 */
async function importGatewaySelector(flowEnabled: string | undefined) {
  vi.resetModules();
  if (flowEnabled !== undefined) {
    vi.stubEnv('NEXT_PUBLIC_FLOW_ENABLED', flowEnabled);
  } else {
    vi.unstubAllEnvs();
  }
  const gatewaySelectorModule = await import('../GatewaySelector');
  return gatewaySelectorModule.GatewaySelector;
}

// --- Tests -------------------------------------------------------------------

describe('GatewaySelector', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  describe('cuando NEXT_PUBLIC_FLOW_ENABLED es "true"', () => {
    it('muestra el botón de Flow en el selector', async () => {
      const GatewaySelector = await importGatewaySelector('true');
      const props = createGatewaySelectorProps();

      render(<GatewaySelector {...props} />);

      expect(screen.getByRole('button', { name: /flow/i })).toBeInTheDocument();
    });

    it('muestra también los gateways base: Webpay y MercadoPago', async () => {
      const GatewaySelector = await importGatewaySelector('true');
      const props = createGatewaySelectorProps();

      render(<GatewaySelector {...props} />);

      expect(screen.getByRole('button', { name: /webpay/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mercadopago/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /flow/i })).toBeInTheDocument();
    });

    it('invoca onChange con "flow" al hacer click en el botón Flow', async () => {
      const GatewaySelector = await importGatewaySelector('true');
      const onChange = vi.fn();
      const props = createGatewaySelectorProps({ onChange });
      const user = userEvent.setup();

      render(<GatewaySelector {...props} />);

      await user.click(screen.getByRole('button', { name: /flow/i }));

      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenCalledWith('flow');
    });
  });

  describe('cuando NEXT_PUBLIC_FLOW_ENABLED es "false"', () => {
    it('NO muestra el botón de Flow', async () => {
      const GatewaySelector = await importGatewaySelector('false');
      const props = createGatewaySelectorProps();

      render(<GatewaySelector {...props} />);

      expect(screen.queryByRole('button', { name: /flow/i })).not.toBeInTheDocument();
    });

    it('sigue mostrando Webpay y MercadoPago', async () => {
      const GatewaySelector = await importGatewaySelector('false');
      const props = createGatewaySelectorProps();

      render(<GatewaySelector {...props} />);

      expect(screen.getByRole('button', { name: /webpay/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mercadopago/i })).toBeInTheDocument();
    });
  });

  describe('cuando NEXT_PUBLIC_FLOW_ENABLED no está definido (valor por defecto)', () => {
    it('NO muestra el botón de Flow', async () => {
      const GatewaySelector = await importGatewaySelector(undefined);
      const props = createGatewaySelectorProps();

      render(<GatewaySelector {...props} />);

      expect(screen.queryByRole('button', { name: /flow/i })).not.toBeInTheDocument();
    });
  });

  describe('selección de gateway', () => {
    it('resalta el gateway seleccionado con la clase de border activo', async () => {
      const GatewaySelector = await importGatewaySelector('true');
      const props = createGatewaySelectorProps({ selected: 'flow' });

      render(<GatewaySelector {...props} />);

      const flowButton = screen.getByRole('button', { name: /flow/i });
      // El gateway seleccionado recibe la clase border-fuchsia-500
      expect(flowButton.className).toContain('border-fuchsia-500');
    });

    it('invoca onChange con el gateway correcto al hacer click en Webpay', async () => {
      const GatewaySelector = await importGatewaySelector('false');
      const onChange = vi.fn();
      const props = createGatewaySelectorProps({ selected: 'mercadopago', onChange });
      const user = userEvent.setup();

      render(<GatewaySelector {...props} />);

      await user.click(screen.getByRole('button', { name: /webpay/i }));

      expect(onChange).toHaveBeenCalledWith('webpay');
    });
  });
});
