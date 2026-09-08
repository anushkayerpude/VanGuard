/**
 * Web Audio API Timer Bomb Sound Synthesizer for Vanguard C4ISR
 * Authentic digital C4 timer bomb ticks, accelerating countdown beeps, keypad arming,
 * defusal chimes, and high-energy detonation shockwaves.
 */

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeTimerInterval: number | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.activeTimerInterval) {
      clearInterval(this.activeTimerInterval);
      this.activeTimerInterval = null;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // =========================================================================
  // 1. CLASSIC C4 TIMER BOMB BEEP (High-pitch 2400Hz piercing digital chirp)
  // =========================================================================
  public playTimeBombTick(pitch: number = 2400, isFinal: boolean = false) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

      const duration = isFinal ? 0.35 : 0.06;
      const volume = isFinal ? 0.3 : 0.18;

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      // Low pass to soften harsh aliasing while keeping sharp attack
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration + 0.02);
    } catch {
      // Audio context might require initial user gesture
    }
  }

  // Alias for backward compatibility & countdown loops
  public playCountdownBeep(isFinal: boolean = false) {
    this.playTimeBombTick(isFinal ? 2800 : 2200, isFinal);
  }

  // =========================================================================
  // 2. ACCELERATING TIME BOMB COUNTDOWN (Ticking sequence)
  // =========================================================================
  public startAcceleratingBombTimer(
    totalSeconds: number = 10,
    onTick?: (remaining: number) => void,
    onDetonate?: () => void
  ) {
    if (this.activeTimerInterval) {
      clearInterval(this.activeTimerInterval);
      this.activeTimerInterval = null;
    }

    let remaining = totalSeconds;
    this.playBombArmed();

    const runTick = () => {
      if (this.isMuted) return;
      if (remaining <= 0) {
        this.playDetonationRumble();
        if (onDetonate) onDetonate();
        return;
      }

      this.playTimeBombTick(2200 + (totalSeconds - remaining) * 60, remaining === 1);
      if (onTick) onTick(remaining);
      remaining -= 1;

      // Accelerate tick speed as countdown approaches zero
      const nextDelayMs = Math.max(120, (remaining / totalSeconds) * 1000);
      this.activeTimerInterval = window.setTimeout(runTick, nextDelayMs);
    };

    this.activeTimerInterval = window.setTimeout(runTick, 1000);
  }

  public stopBombTimer() {
    if (this.activeTimerInterval) {
      clearTimeout(this.activeTimerInterval);
      this.activeTimerInterval = null;
    }
  }

  // =========================================================================
  // 3. BOMB ARMED KEYPAD SEQUENCE (Classic C4 Arming Bips)
  // =========================================================================
  public playBombArmed() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [1200, 1600, 2000, 2400];
      notes.forEach((freq, idx) => {
        const time = this.ctx!.currentTime + idx * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(time);
        osc.stop(time + 0.07);
      });
    } catch {
      // Ignore
    }
  }

  // =========================================================================
  // 4. BOMB DEFUSED CHIME
  // =========================================================================
  public playBombDefused() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [880, 1100, 1320, 1760];
      notes.forEach((freq, idx) => {
        const time = this.ctx!.currentTime + idx * 0.09;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(time);
        osc.stop(time + 0.28);
      });
    } catch {
      // Ignore
    }
  }

  // =========================================================================
  // 5. DIGITAL KEYPAD CLICK
  // =========================================================================
  public playClick(freq: number = 1800) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, this.ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Ignore
    }
  }

  // =========================================================================
  // 6. TARGET LOCK PULSE
  // =========================================================================
  public playTargetLock() {
    this.playTimeBombTick(2600, false);
    setTimeout(() => this.playTimeBombTick(2800, false), 80);
  }

  // =========================================================================
  // 7. RADAR SWEEP PING (Digital Timer Locator Tone)
  // =========================================================================
  public playRadarPing(pitch: number = 2100) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, this.ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch {
      // Ignore
    }
  }

  // =========================================================================
  // 8. MISSILE LAUNCH RAMJET IGNITION
  // =========================================================================
  public playMissileLaunch() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(1600, this.ctx.currentTime + 1.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 1.8);
    } catch {
      // Ignore
    }
  }

  // =========================================================================
  // 9. HIGH-ENERGY DETONATION SHOCKWAVE / BOMB EXPLOSION
  // =========================================================================
  public playDetonationRumble() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Sub-bass oscillator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 3.2);

      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.8);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 3.8);

      // White noise explosion burst
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(400, this.ctx.currentTime);
      noiseFilter.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 1.2);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 1.6);
    } catch {
      // Ignore
    }
  }

  // =========================================================================
  // 10. THREAT KLAXON / BOMB TIME WARNING
  // =========================================================================
  public playAlarmKlaxon() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.38);
    } catch {
      // Ignore
    }
  }
}

export const soundFx = new SoundEffectsService();
