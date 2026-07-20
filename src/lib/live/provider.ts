export type CreateLiveSessionInput = {
  streamId: string;
  creatorId: string;
};

export type LiveTransportSession = {
  provider: "demo";
  roomId: string;
  ingestUrl: null;
  playbackUrl: null;
  mode: "preview";
};

export interface LiveVideoProvider {
  createSession(input: CreateLiveSessionInput): Promise<LiveTransportSession>;
  endSession(roomId: string): Promise<void>;
}

class DemoLiveVideoProvider implements LiveVideoProvider {
  async createSession(input: CreateLiveSessionInput): Promise<LiveTransportSession> {
    return {
      provider: "demo",
      roomId: `preview-${input.streamId}`,
      ingestUrl: null,
      playbackUrl: null,
      mode: "preview",
    };
  }

  async endSession() {
    return Promise.resolve();
  }
}

export function getLiveVideoProvider(): LiveVideoProvider {
  const provider = process.env.LIVE_VIDEO_PROVIDER ?? "demo";
  if (provider !== "demo") throw new Error(`Unsupported LIVE_VIDEO_PROVIDER: ${provider}`);
  return new DemoLiveVideoProvider();
}
