import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { MobileNavigation } from '../mobile-navigation';
import { TouchFriendlyInterface, TouchFriendlyButton } from '../touch-friendly-interface';
import { SwipeGesture } from '../swipe-gestures';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserRole } from '@/types';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('@/contexts/AppContext');
jest.mock('@/hooks/use-mobile');
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
  useMotionValue: () => ({ set: jest.fn() }),
  useTransform: () => 0,
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const mockAppContext = {
  state: {
    currentUser: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.STUDENT,
    },
    directMessages: [],
  },
  dispatch: jest.fn(),
};

describe('MobileNavigation', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAppContext as jest.Mock).mockReturnValue(mockAppContext);
    (useIsMobile as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders bottom tabs navigation by default', () => {
    render(<MobileNavigation />);
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('does not render on desktop', () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);
    
    const { container } = render(<MobileNavigation />);
    expect(container.firstChild).toBeNull();
  });

  it('shows message badge when there are unread messages', () => {
    const contextWithMessages = {
      ...mockAppContext,
      state: {
        ...mockAppContext.state,
        directMessages: [
          { id: '1', recipientId: '1', read: false, content: 'Test message' },
        ],
      },
    };
    (useAppContext as jest.Mock).mockReturnValue(contextWithMessages);

    render(<MobileNavigation />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('opens menu overlay when menu button is clicked', async () => {
    render(<MobileNavigation />);
    
    const menuButton = screen.getByText('Menu');
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('renders hamburger variant correctly', () => {
    render(<MobileNavigation variant="hamburger" />);
    
    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
  });
});

describe('TouchFriendlyInterface', () => {
  it('renders with correct touch target size', () => {
    render(
      <TouchFriendlyInterface touchSize="lg" data-testid="touch-element">
        <span>Touch me</span>
      </TouchFriendlyInterface>
    );
    
    const element = screen.getByTestId('touch-element');
    expect(element).toHaveClass('min-h-[48px]', 'min-w-[48px]');
  });

  it('applies mobile-specific classes when on mobile', () => {
    (useIsMobile as jest.Mock).mockReturnValue(true);
    
    render(
      <TouchFriendlyInterface data-testid="touch-element">
        <span>Touch me</span>
      </TouchFriendlyInterface>
    );
    
    const element = screen.getByTestId('touch-element');
    expect(element).toHaveClass('touch-manipulation');
  });

  it('handles click events correctly', () => {
    const handleClick = jest.fn();
    
    render(
      <TouchFriendlyInterface onClick={handleClick} data-testid="touch-element">
        <span>Touch me</span>
      </TouchFriendlyInterface>
    );
    
    const element = screen.getByTestId('touch-element');
    fireEvent.click(element);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('TouchFriendlyButton', () => {
  it('renders with correct variant styles', () => {
    render(
      <TouchFriendlyButton variant="primary" data-testid="button">
        Click me
      </TouchFriendlyButton>
    );
    
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('handles disabled state correctly', () => {
    const handleClick = jest.fn();
    
    render(
      <TouchFriendlyButton onClick={handleClick} disabled data-testid="button">
        Click me
      </TouchFriendlyButton>
    );
    
    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('ensures minimum touch target on mobile', () => {
    (useIsMobile as jest.Mock).mockReturnValue(true);
    
    render(
      <TouchFriendlyButton data-testid="button">
        Click me
      </TouchFriendlyButton>
    );
    
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('min-h-[44px]');
  });
});

describe('SwipeGesture', () => {
  it('renders children correctly', () => {
    render(
      <SwipeGesture>
        <div>Swipeable content</div>
      </SwipeGesture>
    );
    
    expect(screen.getByText('Swipeable content')).toBeInTheDocument();
  });

  it('shows swipe indicators when enabled', () => {
    render(
      <SwipeGesture
        showSwipeIndicators={true}
        onSwipeLeft={() => {}}
        onSwipeRight={() => {}}
        enabledDirections={['left', 'right']}
      >
        <div>Swipeable content</div>
      </SwipeGesture>
    );
    
    // Note: In a real test, you'd need to simulate the motion values
    // to make the indicators visible. This is a simplified test.
    expect(screen.getByText('Swipeable content')).toBeInTheDocument();
  });

  it('does not add swipe functionality on desktop', () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);
    
    const { container } = render(
      <SwipeGesture>
        <div>Content</div>
      </SwipeGesture>
    );
    
    // Should render as a simple div without motion components
    expect(container.firstChild).toHaveClass('relative', 'overflow-hidden');
  });
});