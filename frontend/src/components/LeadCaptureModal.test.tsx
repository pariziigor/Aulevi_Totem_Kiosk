// 1. Importa os matchers do DOM para resolver os erros de 'toBeInTheDocument', 'toBeDisabled', etc.
import '@testing-library/jest-dom';

// 2. Importa as funções globais explicitamente (padrão Vitest) para resolver o erro de namespace
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { LeadCaptureModal } from './LeadCaptureModal';

describe('Componente: LeadCaptureModal', () => {
  // 3. Trocamos jest.fn() por vi.fn()
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    // Trocamos jest.clearAllMocks() por vi.clearAllMocks()
    vi.clearAllMocks();
  });

  it('deve renderizar o modal corretamente com os campos vazios', () => {
    render(<LeadCaptureModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    
    expect(screen.getByText('Identificação Necessária')).toBeInTheDocument();
    expect(screen.getByText('Nome Completo')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp (apenas números)')).toBeInTheDocument();
    
    const confirmButton = screen.getByText('Confirmar e Gerar');
    expect(confirmButton).toBeDisabled();
  });

  it('deve registrar a entrada de texto no campo ativo através do teclado virtual', () => {
    render(<LeadCaptureModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'T' }));
    fireEvent.click(screen.getByRole('button', { name: 'E' }));
    fireEvent.click(screen.getByRole('button', { name: 'S' }));
    fireEvent.click(screen.getByRole('button', { name: 'T' }));
    fireEvent.click(screen.getByRole('button', { name: 'E' }));

    expect(screen.getByText('teste')).toBeInTheDocument();
  });

  it('deve bloquear caracteres não numéricos quando o campo de telefone estiver ativo', () => {
    render(<LeadCaptureModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    
    fireEvent.click(screen.getByText('WhatsApp (apenas números)'));

    const buttonA = screen.getByRole('button', { name: 'A' });
    const button9 = screen.getByRole('button', { name: '9' });

    expect(buttonA).toBeDisabled();
    expect(button9).not.toBeDisabled();

    fireEvent.click(buttonA);
    fireEvent.click(button9);
    fireEvent.click(screen.getByRole('button', { name: '8' }));

    expect(screen.getByText('98')).toBeInTheDocument();
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('deve habilitar o botão de confirmação apenas quando formulário for válido e a LGPD aceita', () => {
    render(<LeadCaptureModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    
    const confirmButton = screen.getByText('Confirmar e Gerar');
    const checkboxLgpd = screen.getByRole('checkbox');

    fireEvent.click(screen.getByRole('button', { name: 'A' }));
    fireEvent.click(screen.getByRole('button', { name: 'B' }));
    fireEvent.click(screen.getByRole('button', { name: 'C' }));

    fireEvent.click(screen.getByText('WhatsApp (apenas números)'));
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByRole('button', { name: '1' }));
    }

    fireEvent.click(checkboxLgpd);

    expect(checkboxLgpd).toBeChecked();
    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);
    expect(mockOnConfirm).toHaveBeenCalledWith('abc', '1111111111');
  });

  it('deve acionar a função onCancel ao clicar no botão Cancelar', () => {
    render(<LeadCaptureModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    
    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});