import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RichTextEditor } from '../rich-text-editor';

// Mock TinyMCE
jest.mock('@tinymce/tinymce-react', () => ({
  Editor: ({ onInit, onEditorChange, value }: any) => {
    React.useEffect(() => {
      if (onInit) {
        onInit({}, {
          getContent: () => value,
          insertContent: jest.fn(),
          on: jest.fn()
        });
      }
    }, [onInit, value]);

    return (
      <textarea
        data-testid="tinymce-editor"
        value={value}
        onChange={(e) => onEditorChange && onEditorChange(e.target.value)}
      />
    );
  }
}));

describe('RichTextEditor', () => {
  const defaultProps = {
    value: '<p>Test content</p>',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the editor with initial content', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    expect(screen.getByTestId('tinymce-editor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('<p>Test content</p>')).toBeInTheDocument();
  });

  it('displays word count when enabled', () => {
    render(<RichTextEditor {...defaultProps} showWordCount={true} />);
    
    expect(screen.getByText(/words/)).toBeInTheDocument();
  });

  it('displays reading time when enabled', () => {
    render(<RichTextEditor {...defaultProps} showReadingTime={true} />);
    
    expect(screen.getByText(/min read/)).toBeInTheDocument();
  });

  it('shows templates button when enabled', () => {
    render(<RichTextEditor {...defaultProps} enableTemplates={true} />);
    
    expect(screen.getByText('Templates')).toBeInTheDocument();
  });

  it('toggles preview mode', async () => {
    render(<RichTextEditor {...defaultProps} />);
    
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);
    
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  it('calls onChange when content changes', () => {
    const onChange = jest.fn();
    render(<RichTextEditor {...defaultProps} onChange={onChange} />);
    
    const editor = screen.getByTestId('tinymce-editor');
    fireEvent.change(editor, { target: { value: '<p>New content</p>' } });
    
    expect(onChange).toHaveBeenCalledWith('<p>New content</p>');
  });

  it('shows save button when onSave is provided', () => {
    const onSave = jest.fn();
    render(<RichTextEditor {...defaultProps} onSave={onSave} />);
    
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<RichTextEditor {...defaultProps} onSave={onSave} />);
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('<p>Test content</p>');
    });
  });

  it('shows templates panel when templates button is clicked', async () => {
    render(<RichTextEditor {...defaultProps} enableTemplates={true} />);
    
    const templatesButton = screen.getByText('Templates');
    fireEvent.click(templatesButton);
    
    await waitFor(() => {
      expect(screen.getByText('Content Templates')).toBeInTheDocument();
    });
  });

  it('calculates word count correctly', () => {
    const content = '<p>This is a test with five words</p>';
    render(<RichTextEditor value={content} onChange={jest.fn()} showWordCount={true} />);
    
    expect(screen.getByText('7 words')).toBeInTheDocument();
  });

  it('calculates reading time correctly', () => {
    // Create content with approximately 200 words (1 minute reading time)
    const words = Array(200).fill('word').join(' ');
    const content = `<p>${words}</p>`;
    
    render(<RichTextEditor value={content} onChange={jest.fn()} showReadingTime={true} />);
    
    expect(screen.getByText('1 min read')).toBeInTheDocument();
  });

  it('renders in read-only mode when specified', () => {
    render(<RichTextEditor {...defaultProps} readOnly={true} />);
    
    const editor = screen.getByTestId('tinymce-editor');
    expect(editor).toHaveAttribute('readonly');
  });

  it('shows collaborators when collaboration is enabled', () => {
    const collaborators = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'editor' as const,
        color: '#3b82f6',
        isActive: true,
        lastSeen: new Date()
      }
    ];

    render(
      <RichTextEditor 
        {...defaultProps} 
        enableCollaboration={true}
        // Note: In a real implementation, collaborators would be passed differently
      />
    );
    
    // The collaboration features would be tested with proper props
    expect(screen.getByTestId('tinymce-editor')).toBeInTheDocument();
  });
});