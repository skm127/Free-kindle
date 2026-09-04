import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookCard from '../BookCard';

describe('BookCard', () => {
  const mockBook = {
    id: 'test-1',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverUrl: 'https://example.com/cover.jpg',
  };

  it('renders book title', () => {
    render(<BookCard book={mockBook} onClick={() => {}} />);
    expect(screen.getByText('Atomic Habits')).toBeInTheDocument();
  });

  it('renders author name', () => {
    render(<BookCard book={mockBook} onClick={() => {}} />);
    expect(screen.getByText('James Clear')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<BookCard book={mockBook} onClick={handleClick} />);
    screen.getByText('Atomic Habits').closest('[class]').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
