// DOM utility functions for cleaner code

export function qs(selector, parent = document) {
    return parent.querySelector(selector);
  }
  
  export function qsa(selector, parent = document) {
    return parent.querySelectorAll(selector);
  }
  
  export function el(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
  
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else if (key === 'disabled') {
        // Handle disabled attribute properly - only set if true
        if (value) {
          element.disabled = true;
        }
      } else {
        element.setAttribute(key, value);
      }
    });
  
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  
    return element;
  }
  
  export function show(element) {
    element.classList.remove('hidden');
  }
  
  export function hide(element) {
    element.classList.add('hidden');
  }
  
  export function setText(element, text) {
    element.textContent = text;
  }
  
  export function setClass(element, className, condition) {
    if (condition) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }
  
  export function empty(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
  