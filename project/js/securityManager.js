export class SecurityManager {
  static setupSecurityMeasures() {
    this.preventDebugging();
    this.preventDevTools();
    this.preventRightClick();
    this.monitorWindowSize();
    this.preventIframeEmbedding();
  }

  static preventDebugging() {
    setInterval(() => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        window.location.replace('https://www.google.com');
      }
    }, 1000);
  }

  static preventDevTools() {
    window.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && 
          ['c', 'u', 's', 'i', 'j'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }
    }, true);
  }

  static preventRightClick() {
    window.addEventListener('contextmenu', e => e.preventDefault());
  }

  static monitorWindowSize() {
    let lastKnownOuterHeight = window.outerHeight;
    let lastKnownOuterWidth = window.outerWidth;

    setInterval(() => {
      if (window.outerHeight !== lastKnownOuterHeight || 
          window.outerWidth !== lastKnownOuterWidth) {
        window.location.replace('https://www.google.com');
      }
    }, 1000);
  }

  static preventIframeEmbedding() {
    setInterval(() => {
      if (window.self !== window.top) {
        window.top.location = window.self.location;
      }
    }, 1000);
  }
}