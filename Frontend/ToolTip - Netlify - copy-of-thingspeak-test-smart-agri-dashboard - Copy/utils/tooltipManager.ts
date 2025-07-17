// Simple tooltip state management without React Context
class TooltipManager {
  private isEnabled = false;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.initialized) return;
    
    // Load from localStorage on initialization
    try {
      const saved = localStorage.getItem('tooltipEnabled');
      if (saved !== null) {
        this.isEnabled = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Error loading tooltip preference:', error);
    }
    
    this.initialized = true;
  }

  getEnabled(): boolean {
    return this.isEnabled;
  }

  setEnabled(enabled: boolean): void {
    if (this.isEnabled === enabled) return;
    
    this.isEnabled = enabled;
    
    try {
      localStorage.setItem('tooltipEnabled', JSON.stringify(enabled));
    } catch (error) {
      console.warn('Error saving tooltip preference:', error);
    }
    
    // Dispatch custom event for components to listen
    window.dispatchEvent(new CustomEvent('tooltipStateChanged', { 
      detail: { enabled } 
    }));
  }

  toggle(): void {
    this.setEnabled(!this.isEnabled);
  }
}

export const tooltipManager = new TooltipManager();
