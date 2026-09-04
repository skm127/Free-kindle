import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookCover from '../BookCover';

describe('BookCover', () => {
  it('renders fallback cover when no coverUrl provided', () => {
    const { container } = render(<BookCover title="Test Book" author="Test Author" />);
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('renders fallback cover with cleaned title', () => {
    render(<BookCover title="my_book.epub" />);
    expect(screen.getByText('my book')).toBeInTheDocument();
  });

  it('renders img tag when coverUrl is provided', () => {
    render(<BookCover title="Test" coverUrl="https://example.com/cover.jpg" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
  });

  it('shows Free Edition badge on fallback', () => {
    render(<BookCover title="Test Book" />);
    expect(screen.getByText('Free Edition')).toBeInTheDocument();
  });
});
