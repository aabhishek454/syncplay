export type RoomState = {
  code: string;
  song_url: string;
  song_title: string;
  is_playing: boolean;
  seek_position: number;
  updated_at: string;
};

export type BroadcastEvent =
  | { type: 'playback'; payload: { isPlaying: boolean; seekPosition: number } }
  | { type: 'seek'; payload: { seekPosition: number } }
  | { type: 'songChange'; payload: { songUrl: string; songTitle: string } }
  | { type: 'heartbeat'; payload: { type: string } };
