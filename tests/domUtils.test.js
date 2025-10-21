// DOM utility tests

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { qs, qsa, el, show, hide, setText, setClass, empty } from '../src/utils/dom.js';

// Mock DOM environment
const mockDocument = {
  createElement: vi.fn(),
  createTextNode: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn()
};

// Mock element creation
const createMockElement = (tag = 'div') => ({
  tagName: tag.toUpperCase(),
  className: '',
  textContent: '',
  children: [],
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn()
  },
  setAttribute: vi.fn(),
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  addEventListener: vi.fn(),
  firstChild: null,
  disabled: false
});

describe('DOM Utilities', () => {
  let mockElement;

  beforeEach(() => {
    vi.clearAllMocks();
    mockElement = createMockElement();
    mockDocument.createElement.mockReturnValue(mockElement);
    mockDocument.createTextNode.mockImplementation(text => ({ nodeType: 3, textContent: text }));
  });

  describe('el', () => {
    beforeEach(() => {
      // Mock the global document
      vi.stubGlobal('document', mockDocument);
    });

    it('should create element with tag name', () => {
      el('button');
      expect(mockDocument.createElement).toHaveBeenCalledWith('button');
    });

    it('should set className attribute', () => {
      const attributes = { className: 'test-class' };
      el('div', attributes);
      expect(mockElement.className).toBe('test-class');
    });

    it('should set textContent attribute', () => {
      const attributes = { textContent: 'test text' };
      el('div', attributes);
      expect(mockElement.textContent).toBe('test text');
    });

    it('should handle disabled attribute properly', () => {
      // Test disabled = true
      const attributes1 = { disabled: true };
      const element1 = createMockElement();
      mockDocument.createElement.mockReturnValueOnce(element1);
      el('button', attributes1);
      expect(element1.disabled).toBe(true);

      // Test disabled = false (should not set)
      const attributes2 = { disabled: false };
      const element2 = createMockElement();
      mockDocument.createElement.mockReturnValueOnce(element2);
      el('button', attributes2);
      expect(element2.disabled).toBe(false);
    });

    it('should add event listeners for on* attributes', () => {
      const clickHandler = vi.fn();
      const attributes = { onClick: clickHandler };
      el('button', attributes);
      expect(mockElement.addEventListener).toHaveBeenCalledWith('click', clickHandler);
    });

    it('should set other attributes via setAttribute', () => {
      const attributes = { id: 'test-id', 'data-value': 'test' };
      el('div', attributes);
      expect(mockElement.setAttribute).toHaveBeenCalledWith('id', 'test-id');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('data-value', 'test');
    });

    it('should append string children as text nodes', () => {
      const textNode = { nodeType: 3, textContent: 'test text' };
      mockDocument.createTextNode.mockReturnValue(textNode);

      el('div', {}, ['test text']);

      expect(mockDocument.createTextNode).toHaveBeenCalledWith('test text');
      expect(mockElement.appendChild).toHaveBeenCalledWith(textNode);
    });

    it('should append element children directly', () => {
      const childElement = createMockElement();
      el('div', {}, [childElement]);
      expect(mockElement.appendChild).toHaveBeenCalledWith(childElement);
    });
  });

  describe('show and hide', () => {
    it('should remove hidden class when showing', () => {
      const element = createMockElement();
      show(element);
      expect(element.classList.remove).toHaveBeenCalledWith('hidden');
    });

    it('should add hidden class when hiding', () => {
      const element = createMockElement();
      hide(element);
      expect(element.classList.add).toHaveBeenCalledWith('hidden');
    });
  });

  describe('setText', () => {
    it('should set textContent', () => {
      const element = createMockElement();
      setText(element, 'new text');
      expect(element.textContent).toBe('new text');
    });
  });

  describe('setClass', () => {
    it('should add class when condition is true', () => {
      const element = createMockElement();
      setClass(element, 'active', true);
      expect(element.classList.add).toHaveBeenCalledWith('active');
    });

    it('should remove class when condition is false', () => {
      const element = createMockElement();
      setClass(element, 'active', false);
      expect(element.classList.remove).toHaveBeenCalledWith('active');
    });
  });

  describe('empty', () => {
    it('should remove all children', () => {
      const element = createMockElement();
      const child1 = createMockElement();
      const child2 = createMockElement();

      // Mock firstChild behavior
      element.firstChild = child1;
      element.removeChild.mockImplementation(() => {
        if (element.firstChild === child1) {
          element.firstChild = child2;
        } else if (element.firstChild === child2) {
          element.firstChild = null;
        }
      });

      empty(element);

      expect(element.removeChild).toHaveBeenCalledWith(child1);
      expect(element.removeChild).toHaveBeenCalledWith(child2);
    });

    it('should handle empty element', () => {
      const element = createMockElement();
      element.firstChild = null;

      empty(element);

      expect(element.removeChild).not.toHaveBeenCalled();
    });
  });

  describe('qs and qsa', () => {
    beforeEach(() => {
      vi.stubGlobal('document', mockDocument);
    });

    it('should call querySelector on document by default', () => {
      qs('#test');
      expect(mockDocument.querySelector).toHaveBeenCalledWith('#test');
    });

    it('should call querySelector on provided parent', () => {
      const parent = createMockElement();
      parent.querySelector = vi.fn();
      qs('#test', parent);
      expect(parent.querySelector).toHaveBeenCalledWith('#test');
    });

    it('should call querySelectorAll on document by default', () => {
      qsa('.test');
      expect(mockDocument.querySelectorAll).toHaveBeenCalledWith('.test');
    });

    it('should call querySelectorAll on provided parent', () => {
      const parent = createMockElement();
      parent.querySelectorAll = vi.fn();
      qsa('.test', parent);
      expect(parent.querySelectorAll).toHaveBeenCalledWith('.test');
    });
  });
});
