import { memo } from "react";
import clsx from "clsx";

import { Card } from "components/ui";
import mainBanner from "assets/banners/welcompagebanner.png";

export const Welcome = memo(function Welcome({ testName, candidateName }) {
  return (
    <Card
      className={clsx(
        "relative w-full overflow-hidden rounded-2xl shadow-2xl bg-[#0a0a0a]",
      )}
    >
      <div className="relative z-0 w-full">
        <img
          src={mainBanner}
          alt="Welcome banner background"
          className="block w-full h-auto min-h-[220px] object-cover sm:object-contain brightness-[0.8]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
        <div>
          <h2 className="text-2xl font-black tracking-[0.2em] text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] sm:text-4xl md:text-5xl lg:text-7xl">
            {testName}
          </h2>
          <p className="mt-3 text-sm font-medium tracking-wide text-white/80 drop-shadow-lg sm:text-base">
            Candidate: {candidateName}
          </p>
          <div className="mx-auto mt-4 h-[3px] w-24 bg-white/40 rounded-full sm:mt-6 sm:h-[4px] sm:w-32 lg:w-48" />
        </div>
      </div>
    </Card>
  );
});
