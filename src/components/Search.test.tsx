import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Search from './Search';

// Mock fetch
global.fetch = vi.fn();

describe('Search Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search button', () => {
    render(<Search />);
    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toBeDefined();
  });

  it('should open dialog when button is clicked', async () => {
    render(<Search />);
    const button = screen.getByRole('button', { name: 'Search' });

    fireEvent.click(button);

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Search articles...');
      expect(input).toBeDefined();
    });
  });

  it('should not search when query is less than 2 characters', async () => {
    render(<Search />);
    const button = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(button);

    const input = await screen.findByPlaceholderText('Search articles...');
    fireEvent.change(input, { target: { value: 'a' } });

    await waitFor(
      () => {
        expect(fetch).not.toHaveBeenCalled();
      },
      { timeout: 500 },
    );
  });

  it('should perform search with valid query', async () => {
    const mockResults = {
      results: [
        {
          id: 1,
          title: 'Test Article',
          slug: 'test',
          folder: 'docs',
          tags: ['test'],
          distance: 0.5,
        },
      ],
      count: 1,
      query: 'test',
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    } as Response);

    render(<Search />);
    const button = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(button);

    const input = await screen.findByPlaceholderText('Search articles...');
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(
      () => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/search.json',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'test', limit: 10 }),
          }),
        );
      },
      { timeout: 500 },
    );
  });

  it('should display search results', async () => {
    const mockResults = {
      results: [
        {
          id: 1,
          title: 'Test Article',
          slug: 'test',
          folder: 'docs',
          tags: ['testing'],
          distance: 0.5,
        },
      ],
      count: 1,
      query: 'test',
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    } as Response);

    render(<Search />);
    const button = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(button);

    const input = await screen.findByPlaceholderText('Search articles...');
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeDefined();
      expect(screen.getByText('DOCS')).toBeDefined();
      expect(screen.getByText('testing')).toBeDefined();
    });
  });

  it('should show error message on search failure', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

    render(<Search />);
    const button = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(button);

    const input = await screen.findByPlaceholderText('Search articles...');
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(
        screen.getByText('Search failed. Please try again.'),
      ).toBeDefined();
    });
  });

  it('should show no results message when no results found', async () => {
    const mockResults = {
      results: [],
      count: 0,
      query: 'nonexistent',
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    } as Response);

    render(<Search />);
    const button = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(button);

    const input = await screen.findByPlaceholderText('Search articles...');
    fireEvent.change(input, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(
        screen.getByText(/No results found for "nonexistent"/),
      ).toBeDefined();
    });
  });

  it('should use custom placeholder', async () => {
    render(<Search placeholder="Custom search..." />);
    const button = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(button);

    const input = await screen.findByPlaceholderText('Custom search...');
    expect(input).toBeDefined();
  });

  it('should respect maxResults prop', async () => {
    const mockResults = {
      results: [],
      count: 0,
      query: 'test',
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    } as Response);

    render(<Search maxResults={20} />);
    const button = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(button);

    const input = await screen.findByPlaceholderText('Search articles...');
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(
      () => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/search.json',
          expect.objectContaining({
            body: JSON.stringify({ query: 'test', limit: 20 }),
          }),
        );
      },
      { timeout: 500 },
    );
  });
});
