import { render, screen, fireEvent } from '@testing-library/react';
import DataModal from '@/components/DataModal';

describe('DataModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <DataModal isOpen={false} onClose={mockOnClose} service="Spotify" data={{}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <DataModal isOpen={true} onClose={mockOnClose} service="Spotify" data={{}} />
    );
    expect(screen.getByText('Spotify Data Preview')).toBeInTheDocument();
  });

  it('should display Spotify data correctly', () => {
    render(
      <DataModal isOpen={true} onClose={mockOnClose} service="Spotify" data={{}} />
    );
    expect(screen.getByText('Total Listening Time')).toBeInTheDocument();
    expect(screen.getByText('Tracks Played')).toBeInTheDocument();
    expect(screen.getByText('Top Songs This Month')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <DataModal isOpen={true} onClose={mockOnClose} service="Spotify" data={{}} />
    );
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render different content for different services', () => {
    const { rerender } = render(
      <DataModal isOpen={true} onClose={mockOnClose} service="Spotify" data={{}} />
    );
    expect(screen.getByText('Spotify Data Preview')).toBeInTheDocument();

    rerender(
      <DataModal isOpen={true} onClose={mockOnClose} service="Instagram" data={{}} />
    );
    expect(screen.getByText('Instagram Data Preview')).toBeInTheDocument();
  });
});
