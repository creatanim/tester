import React from "react";
import { Composition } from "remotion";
import { Episode, totalFrames } from "./rail/Episode";

export const Root: React.FC = () => (
  <>
    <Composition id="Railroads" component={Episode} width={720} height={1280} fps={30} durationInFrames={totalFrames()} defaultProps={{ captions: true }} />
  </>
);
