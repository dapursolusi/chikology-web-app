declare module 'face-api.js' {
  export type TNetInput = object;

  export interface FaceExpressions {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
    disgusted: number;
    surprised: number;
  }

  export interface WithFaceExpressions {
    expressions: FaceExpressions;
    detection: FaceDetection;
  }

  export interface FaceDetection {
    box: Box;
    score: number;
  }

  export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export class TinyFaceDetectorOptions {
    constructor(options?: { inputSize?: number; scoreThreshold?: number });
  }

  export const nets: {
    tinyFaceDetector: {
      loadFromUri(uri: string): Promise<void>;
    };
    faceLandmark68Net: {
      loadFromUri(uri: string): Promise<void>;
    };
    faceExpressionNet: {
      loadFromUri(uri: string): Promise<void>;
    };
  };

  export function detectSingleFace(
    input: TNetInput | HTMLVideoElement,
    options?: TinyFaceDetectorOptions
  ): {
    withFaceLandmarks(): {
      withFaceExpressions(): Promise<WithFaceExpressions | undefined>;
    };
    withFaceExpressions(): Promise<WithFaceExpressions | undefined>;
  };
}
