import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadCaptureModal } from '../../components/LeadCaptureModal'; // Ajuste o caminho se necessário

describe('Componente: LeadCaptureModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
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
    
    // CORREÇÃO: Procurando as letras minúsculas exatas do array base
    fireEvent.click(screen.getByRole('button', { name: 't' }));
    fireEvent.click(screen.getByRole('button', { name: 'e' }));
    fireEvent.click(screen.getByRole('button', { name: 's' }));
    fireEvent.click(screen.getByRole('button', { name: 't' }));
    fireEvent.click(screen.getByRole('button', { name: 'e' }));

    expect(screen.getByText('teste')).toBeInTheDocument();
  });

  it('deve bloquear caracteres não numéricos quando o campo de telefone estiver ativo', () => {
    render(<LeadCaptureModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    
    fireEvent.click(screen.getByText('WhatsApp (apenas números)'));

    // CORREÇÃO: Letra 'a' minúscula
    const buttonA = screen.getByRole('button', { name: 'a' });
    const button9 = screen.getByRole('button', { name: '9' });

    expect(buttonA).toBeDisabled();
    expect(button9).not.toBeDisabled();

    fireEvent.click(buttonA);
    fireEvent.click(button9);
    fireEvent.click(screen.getByRole('button', { name: '8' }));

    expect(screen.getByText('98')).toBeInTheDocument();
  });

  it('deve habilitar o botão de confirmação apenas quando formulário for válido e a LGPD aceita', () => {
    render(<LeadCaptureModal onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    
    const confirmButton = screen.getByText('Confirmar e Gerar');
    const checkboxLgpd = screen.getByRole('checkbox');

    // CORREÇÃO: Letras minúsculas
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    fireEvent.click(screen.getByRole('button', { name: 'b' }));
    fireEvent.click(screen.getByRole('button', { name: 'c' }));

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