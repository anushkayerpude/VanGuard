/**
 * SoundEffectsService - Audio Disabled
 * All audio playback has been completely disabled and muted.
 */

class SoundEffectsService {
  public setMuted(_muted: boolean) {}
  public getMuted(): boolean {
    return true;
  }
  public playTimeBombTick(_pitch?: number, _isFinal?: boolean) {}
  public playCountdownBeep(_isFinal?: boolean) {}
  public startAcceleratingBombTimer(
    _totalSeconds?: number,
    _onTick?: (remaining: number) => void,
    _onDetonate?: () => void
  ) {}
  public stopBombTimer() {}
  public playBombArmed() {}
  public playBombDefused() {}
  public playClick(_freq?: number) {}
  public playTargetLock() {}
  public playRadarPing(_pitch?: number) {}
  public playMissileLaunch() {}
  public playDetonationRumble() {}
  public playAlarmKlaxon() {}
}

export const soundFx = new SoundEffectsService();
