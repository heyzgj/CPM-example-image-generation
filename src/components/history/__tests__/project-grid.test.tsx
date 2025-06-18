import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectGrid } from '../project-grid'
import { mockProjectHistory, mockStorageService } from '@/lib/test-utils'

// Mock the storage service
jest.mock('@/lib/storage/project-storage', () => ({
  getProjectStorage: () => mockStorageService
}))

// Mock intersection observer
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})
window.IntersectionObserver = mockIntersectionObserver

describe('ProjectGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStorageService.getProjects.mockResolvedValue({
      success: true,
      data: { projects: [mockProjectHistory], hasMore: false }
    })
  })

  it('renders loading state initially', () => {
    render(<ProjectGrid />)
    expect(screen.getByText(/loading projects/i)).toBeInTheDocument()
  })

  it('renders projects after loading', async () => {
    render(<ProjectGrid />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })
  })

  it('handles empty state', async () => {
    mockStorageService.getProjects.mockResolvedValue({
      success: true,
      data: { projects: [], hasMore: false }
    })

    render(<ProjectGrid />)
    
    await waitFor(() => {
      expect(screen.getByText(/no projects found/i)).toBeInTheDocument()
    })
  })

  it('handles error state', async () => {
    mockStorageService.getProjects.mockResolvedValue({
      success: false,
      error: 'Failed to load projects'
    })

    render(<ProjectGrid />)
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load projects/i)).toBeInTheDocument()
    })
  })

  it('filters projects by search query', async () => {
    const user = userEvent.setup()
    render(<ProjectGrid />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search projects/i)
    await user.type(searchInput, 'nonexistent')

    await waitFor(() => {
      expect(mockStorageService.searchProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'nonexistent'
        })
      )
    })
  })

  it('filters projects by style', async () => {
    const user = userEvent.setup()
    render(<ProjectGrid />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    const styleFilter = screen.getByRole('combobox', { name: /style/i })
    await user.click(styleFilter)
    
    const renaissanceOption = screen.getByText('Renaissance')
    await user.click(renaissanceOption)

    await waitFor(() => {
      expect(mockStorageService.getProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          style: 'renaissance'
        })
      )
    })
  })

  it('sorts projects correctly', async () => {
    const user = userEvent.setup()
    render(<ProjectGrid />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    const sortSelect = screen.getByRole('combobox', { name: /sort/i })
    await user.click(sortSelect)
    
    const nameOption = screen.getByText('Name')
    await user.click(nameOption)

    await waitFor(() => {
      expect(mockStorageService.getProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'name'
        })
      )
    })
  })

  it('handles project deletion', async () => {
    const user = userEvent.setup()
    mockStorageService.deleteProject.mockResolvedValue({ success: true })
    
    render(<ProjectGrid />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockStorageService.deleteProject).toHaveBeenCalledWith('test-project-1')
    })
  })

  it('handles project favoriting', async () => {
    const user = userEvent.setup()
    mockStorageService.toggleFavorite.mockResolvedValue({ success: true })
    
    render(<ProjectGrid />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    const favoriteButton = screen.getByRole('button', { name: /favorite/i })
    await user.click(favoriteButton)

    await waitFor(() => {
      expect(mockStorageService.toggleFavorite).toHaveBeenCalledWith('test-project-1')
    })
  })

  it('loads more projects when scrolling', async () => {
    mockStorageService.getProjects.mockResolvedValueOnce({
      success: true,
      data: { projects: [mockProjectHistory], hasMore: true }
    })

    render(<ProjectGrid />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    // Simulate intersection observer triggering load more
    const [[callback]] = mockIntersectionObserver.mock.calls
    callback([{ isIntersecting: true }])

    await waitFor(() => {
      expect(mockStorageService.getProjects).toHaveBeenCalledTimes(2)
    })
  })

  it('shows load more button when has more projects', async () => {
    mockStorageService.getProjects.mockResolvedValue({
      success: true,
      data: { projects: [mockProjectHistory], hasMore: true }
    })

    render(<ProjectGrid />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument()
    })
  })

  it('handles load more button click', async () => {
    const user = userEvent.setup()
    mockStorageService.getProjects.mockResolvedValue({
      success: true,
      data: { projects: [mockProjectHistory], hasMore: true }
    })

    render(<ProjectGrid />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument()
    })

    const loadMoreButton = screen.getByRole('button', { name: /load more/i })
    await user.click(loadMoreButton)

    await waitFor(() => {
      expect(mockStorageService.getProjects).toHaveBeenCalledTimes(2)
    })
  })

  it('applies proper accessibility attributes', async () => {
    render(<ProjectGrid />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    const grid = screen.getByRole('grid')
    expect(grid).toHaveAttribute('aria-label', 'Project gallery')

    const searchInput = screen.getByPlaceholderText(/search projects/i)
    expect(searchInput).toHaveAttribute('aria-label', 'Search projects')
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<ProjectGrid />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    const firstProject = screen.getByRole('article')
    firstProject.focus()
    expect(firstProject).toHaveFocus()

    await user.keyboard('{Enter}')
    // Should navigate to project details or trigger action
  })
}) 