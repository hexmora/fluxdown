customElements.define(
  'raw-text',
  class extends HTMLElement {
    static observedAttributes = ['text'];

    attributeChangedCallback(_name: string, _previous: string | null, value: string | null) {
      this.textContent = value;
    }
  },
);
