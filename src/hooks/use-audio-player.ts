
import { useAudioPlayerCore } from './audio/use-audio-player-core';
import { UseAudioPlayerProps, AudioPlayerHookReturn } from './audio/types';

export const useAudioPlayer = (props: UseAudioPlayerProps): AudioPlayerHookReturn => {
  return useAudioPlayerCore(props);
};
