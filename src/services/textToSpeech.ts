/**
 * Text-to-Speech Service
 * Provides reading aloud functionality for book content
 */

export interface TTSOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  currentTime: number;
  duration: number;
}

class TextToSpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.initialize();
    }
  }

  /**
   * Initialize the TTS service
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve) => {
      const loadVoices = () => {
        this.voices = this.synthesis?.getVoices() || [];
        this.isInitialized = true;
        resolve();
      };

      // Chrome loads voices asynchronously
      if (this.synthesis) {
        this.synthesis.onvoiceschanged = loadVoices;
        loadVoices();
      } else {
        resolve();
      }
    });
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    await this.initialize();
    return this.voices;
  }

  /**
   * Get voices by language
   */
  async getVoicesByLanguage(lang: string): Promise<SpeechSynthesisVoice[]> {
    const voices = await this.getVoices();
    return voices.filter(voice => voice.lang.startsWith(lang));
  }

  /**
   * Get default voice for a language
   */
  async getDefaultVoice(lang: string = 'en-US'): Promise<SpeechSynthesisVoice | null> {
    const voices = await this.getVoicesByLanguage(lang);
    return voices.length > 0 ? voices[0] : null;
  }

  /**
   * Speak text
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    await this.initialize();

    if (!this.synthesis) {
      throw new Error('Speech synthesis not supported');
    }

    // Cancel any ongoing speech
    this.stop();

    this.utterance = new SpeechSynthesisUtterance(text);
    
    // Apply options
    if (options.voice) {
      this.utterance.voice = options.voice;
    }
    if (options.rate !== undefined) {
      this.utterance.rate = options.rate;
    }
    if (options.pitch !== undefined) {
      this.utterance.pitch = options.pitch;
    }
    if (options.volume !== undefined) {
      this.utterance.volume = options.volume;
    }
    if (options.lang) {
      this.utterance.lang = options.lang;
    }

    return new Promise((resolve, reject) => {
      if (!this.utterance || !this.synthesis) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      this.utterance.onend = () => resolve();
      this.utterance.onerror = (event) => reject(event.error);
      
      this.synthesis.speak(this.utterance);
    });
  }

  /**
   * Pause speech
   */
  pause(): void {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume speech
   */
  resume(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  /**
   * Stop speech
   */
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.utterance = null;
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }

  /**
   * Check if currently paused
   */
  isPaused(): boolean {
    return this.synthesis?.paused || false;
  }

  /**
   * Check if TTS is supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

// Export singleton instance
export const ttsService = new TextToSpeechService();