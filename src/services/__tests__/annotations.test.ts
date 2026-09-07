import { describe, it, expect, beforeEach } from 'vitest';
import { annotationsService } from '../annotations.ts';

describe('AnnotationsService', () => {
  beforeEach(() => {
    // Clear annotations before each test
    annotationsService.clearBookAnnotations('test-book-1');
    annotationsService.clearBookAnnotations('test-book-2');
  });

  it('should add and retrieve highlights', () => {
    const highlight = annotationsService.addHighlight(
      'test-book-1',
      'Test text to highlight',
      'epubcfi(/6/4[ch1]!/4/2/1:0)',
      '#ffff00'
    );

    expect(highlight.id).toBeDefined();
    expect(highlight.text).toBe('Test text to highlight');
    expect(highlight.color).toBe('#ffff00');

    const highlights = annotationsService.getHighlights('test-book-1');
    expect(highlights.length).toBe(1);
    expect(highlights[0].id).toBe(highlight.id);
  });

  it('should update highlights', () => {
    const highlight = annotationsService.addHighlight(
      'test-book-1',
      'Original text',
      'epubcfi(/6/4[ch1]!/4/2/1:0)',
      '#ffff00'
    );

    const updated = annotationsService.updateHighlight(highlight.id, { color: '#ff0000' });
    expect(updated).toBe(true);

    const highlights = annotationsService.getHighlights('test-book-1');
    expect(highlights[0].color).toBe('#ff0000');
  });

  it('should delete highlights', () => {
    const highlight = annotationsService.addHighlight(
      'test-book-1',
      'Text to delete',
      'epubcfi(/6/4[ch1]!/4/2/1:0)',
      '#ffff00'
    );

    const deleted = annotationsService.deleteHighlight(highlight.id);
    expect(deleted).toBe(true);

    const highlights = annotationsService.getHighlights('test-book-1');
    expect(highlights.length).toBe(0);
  });

  it('should add and retrieve notes', () => {
    const note = annotationsService.addNote(
      'test-book-1',
      'This is a test note',
      'epubcfi(/6/4[ch1]!/4/2/1:0)'
    );

    expect(note.id).toBeDefined();
    expect(note.text).toBe('This is a test note');

    const notes = annotationsService.getNotes('test-book-1');
    expect(notes.length).toBe(1);
  });

  it('should update notes', () => {
    const note = annotationsService.addNote(
      'test-book-1',
      'Original note',
      'epubcfi(/6/4[ch1]!/4/2/1:0)'
    );

    const updated = annotationsService.updateNote(note.id, { text: 'Updated note' });
    expect(updated).toBe(true);

    const notes = annotationsService.getNotes('test-book-1');
    expect(notes[0].text).toBe('Updated note');
  });

  it('should delete notes', () => {
    const note = annotationsService.addNote(
      'test-book-1',
      'Note to delete',
      'epubcfi(/6/4[ch1]!/4/2/1:0)'
    );

    const deleted = annotationsService.deleteNote(note.id);
    expect(deleted).toBe(true);

    const notes = annotationsService.getNotes('test-book-1');
    expect(notes.length).toBe(0);
  });

  it('should add and retrieve bookmarks', () => {
    const bookmark = annotationsService.addBookmark(
      'test-book-1',
      'epubcfi(/6/4[ch1]!/4/2/1:0)',
      'Chapter 1'
    );

    expect(bookmark.id).toBeDefined();
    expect(bookmark.title).toBe('Chapter 1');

    const bookmarks = annotationsService.getBookmarks('test-book-1');
    expect(bookmarks.length).toBe(1);
  });

  it('should toggle bookmarks', () => {
    const bookmark = annotationsService.toggleBookmark(
      'test-book-1',
      'epubcfi(/6/4[ch1]!/4/2/1:0)',
      'Chapter 1'
    );

    expect(bookmark).not.toBeNull();
    expect(annotationsService.isBookmarked('test-book-1', 'epubcfi(/6/4[ch1]!/4/2/1:0)')).toBe(true);

    const removed = annotationsService.toggleBookmark('test-book-1', 'epubcfi(/6/4[ch1]!/4/2/1:0)');
    expect(removed).toBeNull();
    expect(annotationsService.isBookmarked('test-book-1', 'epubcfi(/6/4[ch1]!/4/2/1:0)')).toBe(false);
  });

  it('should get all annotations for a book', () => {
    annotationsService.addHighlight('test-book-1', 'Text', 'cfi1', '#ffff00');
    annotationsService.addNote('test-book-1', 'Note', 'cfi2');
    annotationsService.addBookmark('test-book-1', 'cfi3', 'Bookmark');

    const allAnnotations = annotationsService.getAllAnnotations('test-book-1');
    
    expect(allAnnotations.highlights.length).toBe(1);
    expect(allAnnotations.notes.length).toBe(1);
    expect(allAnnotations.bookmarks.length).toBe(1);
  });

  it('should clear all annotations for a book', () => {
    annotationsService.addHighlight('test-book-1', 'Text', 'cfi1', '#ffff00');
    annotationsService.addNote('test-book-1', 'Note', 'cfi2');
    annotationsService.addBookmark('test-book-1', 'cfi3', 'Bookmark');

    annotationsService.clearBookAnnotations('test-book-1');

    const allAnnotations = annotationsService.getAllAnnotations('test-book-1');
    expect(allAnnotations.highlights.length).toBe(0);
    expect(allAnnotations.notes.length).toBe(0);
    expect(allAnnotations.bookmarks.length).toBe(0);
  });

  it('should export and import annotations', () => {
    annotationsService.addHighlight('test-book-1', 'Text', 'cfi1', '#ffff00');
    annotationsService.addNote('test-book-1', 'Note', 'cfi2');

    const exported = annotationsService.exportAnnotations('test-book-1');
    expect(exported).toBeDefined();

    annotationsService.clearBookAnnotations('test-book-1');
    expect(annotationsService.getAllAnnotations('test-book-1').highlights.length).toBe(0);

    const imported = annotationsService.importAnnotations('test-book-1', exported);
    expect(imported).toBe(true);
    expect(annotationsService.getAllAnnotations('test-book-1').highlights.length).toBe(1);
  });
});