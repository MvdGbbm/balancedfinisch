
export class AudioProcessor {
  private context: AudioContext;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode;
  private analyserNode: AnalyserNode;
  private equalizerBands: BiquadFilterNode[] = [];
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode;
  private dryGain: GainNode;
  private wetGain: GainNode;
  private compressorNode: DynamicsCompressorNode;
  private destinationNode: AudioNode;
  
  // Standard EQ frequencies
  private readonly EQ_FREQUENCIES = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 16000];
  
  constructor(audioElement: HTMLAudioElement | null, destination?: AudioNode) {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.destinationNode = destination || this.context.destination;
    
    // Create nodes
    this.gainNode = this.context.createGain();
    this.analyserNode = this.context.createAnalyser();
    this.reverbGain = this.context.createGain();
    this.dryGain = this.context.createGain();
    this.wetGain = this.context.createGain();
    this.compressorNode = this.context.createDynamicsCompressor();
    
    // Configure analyser
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;
    
    // Set up EQ bands
    this.createEqualizer();
    
    // Default mix
    this.dryGain.gain.value = 1;
    this.wetGain.gain.value = 0;
    this.reverbGain.gain.value = 0;
    
    // Connect audio source if provided
    if (audioElement) {
      this.connectSource(audioElement);
    }
    
    // Load impulse response for reverb
    this.loadReverbImpulse();
  }
  
  public connectSource(audioElement: HTMLAudioElement): void {
    // Disconnect previous source if it exists
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
    
    // Create and connect new source
    this.sourceNode = this.context.createMediaElementSource(audioElement);
    
    // Connect the audio graph
    this.connectAudioGraph();
  }
  
  public getAnalyserNode(): AnalyserNode {
    return this.analyserNode;
  }
  
  private createEqualizer(): void {
    // Clear existing bands
    this.equalizerBands.forEach(band => band.disconnect());
    this.equalizerBands = [];
    
    // Create new bands
    this.EQ_FREQUENCIES.forEach((frequency, index) => {
      const filter = this.context.createBiquadFilter();
      filter.type = index === 0 ? 'lowshelf' : 
                   index === this.EQ_FREQUENCIES.length - 1 ? 'highshelf' : 'peaking';
      filter.frequency.value = frequency;
      filter.gain.value = 0;
      filter.Q.value = 1;
      
      this.equalizerBands.push(filter);
    });
  }
  
  private connectAudioGraph(): void {
    if (!this.sourceNode) return;
    
    // Source -> Compressor -> Analyzer
    this.sourceNode.connect(this.compressorNode);
    this.compressorNode.connect(this.analyserNode);
    
    // Connect EQ bands in series
    let previousNode: AudioNode = this.analyserNode;
    this.equalizerBands.forEach(band => {
      previousNode.connect(band);
      previousNode = band;
    });
    
    // Split to dry path
    previousNode.connect(this.dryGain);
    
    // Create wet path with reverb
    previousNode.connect(this.reverbGain);
    if (this.reverbNode) {
      this.reverbGain.connect(this.reverbNode);
      this.reverbNode.connect(this.wetGain);
    } else {
      this.reverbGain.connect(this.wetGain);
    }
    
    // Combine dry and wet
    this.dryGain.connect(this.gainNode);
    this.wetGain.connect(this.gainNode);
    
    // Output
    this.gainNode.connect(this.destinationNode);
  }
  
  private async loadReverbImpulse(): Promise<void> {
    try {
      // Default hall reverb impulse response
      const response = await fetch("/lovable-uploads/89bef4b9-51c7-4fa8-b0b8-d50b7049c2b4.png");
      const arrayBuffer = await response.arrayBuffer();
      
      this.reverbNode = this.context.createConvolver();
      this.context.decodeAudioData(arrayBuffer, buffer => {
        if (this.reverbNode) {
          this.reverbNode.buffer = buffer;
          
          // Reconnect audio graph if source exists
          if (this.sourceNode) {
            this.connectAudioGraph();
          }
        }
      }).catch(e => {
        console.error("Failed to decode impulse response:", e);
        // Create a fallback impulse response
        this.createFallbackReverb();
      });
    } catch (e) {
      console.error("Error loading reverb impulse:", e);
      this.createFallbackReverb();
    }
  }
  
  private createFallbackReverb(): void {
    // Create a simple impulse response as fallback
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * 2; // 2 seconds
    const impulse = this.context.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const impulseData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    
    this.reverbNode = this.context.createConvolver();
    this.reverbNode.buffer = impulse;
    
    // Reconnect audio graph if source exists
    if (this.sourceNode) {
      this.connectAudioGraph();
    }
  }
  
  // Control methods
  public setMasterVolume(value: number): void {
    this.gainNode.gain.value = value;
  }
  
  public setReverbMix(value: number): void {
    this.dryGain.gain.value = 1 - value;
    this.wetGain.gain.value = value;
  }
  
  public setEqualizerBand(index: number, value: number): void {
    if (index >= 0 && index < this.equalizerBands.length) {
      this.equalizerBands[index].gain.value = value;
    }
  }
  
  public getEqualizerBands(): BiquadFilterNode[] {
    return this.equalizerBands;
  }
  
  public getEqualizerFrequencies(): number[] {
    return this.EQ_FREQUENCIES;
  }
  
  public getBypassedState(): boolean {
    return this.dryGain.gain.value === 1 && this.wetGain.gain.value === 0;
  }
  
  public bypass(bypass: boolean): void {
    if (bypass) {
      this.dryGain.gain.value = 1;
      this.wetGain.gain.value = 0;
    } else {
      this.dryGain.gain.value = 0.7;
      this.wetGain.gain.value = 0.3;
    }
  }
  
  public cleanup(): void {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
    this.gainNode.disconnect();
    this.analyserNode.disconnect();
    this.equalizerBands.forEach(band => band.disconnect());
    if (this.reverbNode) {
      this.reverbNode.disconnect();
    }
    this.reverbGain.disconnect();
    this.dryGain.disconnect();
    this.wetGain.disconnect();
    this.compressorNode.disconnect();
  }
}
