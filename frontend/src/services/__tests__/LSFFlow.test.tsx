import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LSFFlow from '../../pages/LSFFlow'; // Ajuste o caminho se necessário
import { useKioskStore } from '../../store/useKioskStore';
import { KioskService } from '../../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../services/api', () => ({
  KioskService: {
    submitQuote: vi.fn(),
  }
}));

describe('Página de Integração: LSFFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const { resetSession } = useKioskStore.getState();
    resetSession();
  });

  const renderFlow = () => {
    return render(
      <MemoryRouter>
        <LSFFlow />
      </MemoryRouter>
    );
  };

  it('deve iniciar na Etapa 1 e o botão "Avançar" deve estar desabilitado se a área for zero', () => {
    renderFlow();
    expect(screen.getByText('Informe a Área (m²)')).toBeInTheDocument();
    const avancaButton = screen.getByText('Avançar');
    expect(avancaButton).toBeDisabled();
  });

  it('deve permitir a digitação da área e avançar para a Etapa 2', async () => {
    renderFlow();

    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: '0' }));

    const avancaButton = screen.getByText('Avançar');
    expect(avancaButton).not.toBeDisabled();

    fireEvent.click(avancaButton);

    // CORREÇÃO: findByText aguarda a animação do Framer Motion concluir e renderizar o elemento
    expect(await screen.findByText('Selecione o Tipo')).toBeInTheDocument();
    expect(await screen.findByText('Casa 1 pav')).toBeInTheDocument();
  });

  it('deve voltar para a Home (/) se o usuário clicar em "Cancelar" na primeira etapa', () => {
    renderFlow();

    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('deve acionar o alerta de Sucesso e redirecionar ao finalizar o fluxo (Mock da Etapa Final)', async () => {
    renderFlow();
    
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    act(() => {
      useKioskStore.setState({
        quoteData: {
          area: '150',
          tipo: 'Casa 1 pav',
          padrao: 'Alto',
          has_facade: true,
          has_project: false
        }
      });
    });

    (KioskService.submitQuote as Mock).mockResolvedValueOnce({ total_value: 300000 });
  });
});