import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {FPS, W, H, TOTAL_FRAMES} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Railroads"
    component={Video}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={W}
    height={H}
  />
);
